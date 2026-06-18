import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../middleware/error.js";
import { generateSite } from "../services/aiGenerator.js";
import { slugify } from "../utils/slug.js";
import { runConsumeAction } from "./credits.js";
import { planCapabilities } from "../services/planCapabilities.js";

const router = Router();

async function getProjectOwned(projectId: string, userId: string, role: string) {
  const p = await prisma.project.findUnique({ where: { id: projectId } });
  if (!p) throw new HttpError(404, "NOT_FOUND", "Projeto não encontrado.");
  if (p.user_id !== userId && role !== "admin") {
    throw new HttpError(403, "FORBIDDEN", "Sem acesso.");
  }
  return p;
}

async function getSiteOwned(siteId: string, userId: string, role: string) {
  const s = await prisma.site.findUnique({ where: { id: siteId }, include: { project: true } });
  if (!s) throw new HttpError(404, "NOT_FOUND", "Site não encontrado.");
  if (s.project.user_id !== userId && role !== "admin") {
    throw new HttpError(403, "FORBIDDEN", "Sem acesso.");
  }
  return s;
}

// Público: GET /public/sites/:slug — sem auth, retorna site + seções.
router.get("/public/sites/:slug", async (req, res) => {
  const site = await prisma.site.findUnique({
    where: { slug: req.params.slug },
    include: { sections: { orderBy: { order_index: "asc" } }, project: { include: { user: true } } },
  });
  if (!site || site.status !== "published") {
    throw new HttpError(404, "NOT_FOUND", "Site não publicado.");
  }
  // Suspende site se assinatura inativa
  if (site.project.user.subscription_status === "canceled") {
    throw new HttpError(404, "NOT_FOUND", "Site indisponível.");
  }
  const { project: _omit, ...rest } = site;
  res.json(rest);
});

// Demais rotas exigem auth
router.use(requireAuth);

router.get("/projects/:id/site", async (req, res) => {
  await getProjectOwned(req.params.id, req.user!.id, req.user!.role);
  const site = await prisma.site.findUnique({
    where: { project_id: req.params.id },
    include: { sections: { orderBy: { order_index: "asc" } } },
  });
  res.json(site);
});

const generateSchema = z.object({
  theme: z.record(z.string(), z.any()).optional(),
  analysis_depth: z.number().int().min(1).max(3).optional(),
});

router.post("/projects/:id/generate-site", validate(generateSchema), async (req, res) => {
  const project = await getProjectOwned(req.params.id, req.user!.id, req.user!.role);
  const briefing = await prisma.briefing.findUnique({ where: { project_id: project.id } });
  if (!briefing) throw new HttpError(422, "VALIDATION", "Briefing obrigatório antes de gerar site.");

  const body = req.body as z.infer<typeof generateSchema>;
  const promptText = [
    briefing.business_name,
    briefing.segment,
    briefing.target_audience,
    briefing.main_offer,
    briefing.goal,
    briefing.notes,
    (briefing.services ?? []).join(", "),
  ]
    .filter(Boolean)
    .join("\n");

  // 1) estimar + validar saldo + consumir (margem 3x garantida no engine)
  const consume = await runConsumeAction(req.user!.id, {
    action: "generate_site",
    prompt_text: promptText,
    sections: 6,
    analysis_depth: body.analysis_depth ?? 2,
    project_id: project.id,
    description: `Geração de site: ${project.title}`,
  });

  // 2) gerar (mock) e persistir
  const result = await generateSite(briefing);
  const slug = await ensureUniqueSlug(result.slug);
  const theme = { ...result.theme, ...(body.theme ?? {}) };

  const site = await prisma.$transaction(async (tx) => {
    const upserted = await tx.site.upsert({
      where: { project_id: project.id },
      update: { title: result.title, slug, theme_config: theme, status: "ready" },
      create: { project_id: project.id, title: result.title, slug, theme_config: theme, status: "ready" },
    });
    await tx.generatedSection.deleteMany({ where: { site_id: upserted.id } });
    await tx.generatedSection.createMany({
      data: result.sections.map((s) => ({ ...s, site_id: upserted.id, config: s.config as object })),
    });
    return tx.site.findUnique({
      where: { id: upserted.id },
      include: { sections: { orderBy: { order_index: "asc" } } },
    });
  });

  res.status(201).json({ site, credits: consume });
});

const siteUpdateSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  theme_config: z.record(z.string(), z.any()).optional(),
});
router.patch("/sites/:id", validate(siteUpdateSchema), async (req, res) => {
  const site = await getSiteOwned(req.params.id, req.user!.id, req.user!.role);
  const data = req.body as z.infer<typeof siteUpdateSchema>;
  if (data.slug && data.slug !== site.slug) {
    data.slug = await ensureUniqueSlug(slugify(data.slug));
  }
  const updated = await prisma.site.update({ where: { id: site.id }, data });
  res.json(updated);
});

const sectionPatchSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  order_index: z.number().int().optional(),
  config: z.record(z.string(), z.any()).optional(),
});
router.patch("/sites/:id/sections/:sectionId", validate(sectionPatchSchema), async (req, res) => {
  const site = await getSiteOwned(req.params.id, req.user!.id, req.user!.role);
  const section = await prisma.generatedSection.findUnique({ where: { id: req.params.sectionId } });
  if (!section || section.site_id !== site.id) throw new HttpError(404, "NOT_FOUND", "Seção não encontrada.");
  const updated = await prisma.generatedSection.update({ where: { id: section.id }, data: req.body });
  res.json(updated);
});

const publishSchema = z.object({
  slug: z.string().min(2).max(60),
  custom_domain: z.string().max(120).optional(),
});
router.post("/sites/:id/publish", validate(publishSchema), async (req, res) => {
  const site = await getSiteOwned(req.params.id, req.user!.id, req.user!.role);
  const body = req.body as z.infer<typeof publishSchema>;

  const user = await prisma.user.findUnique({ where: { id: site.project.user_id } });
  if (!user) throw new HttpError(404, "NOT_FOUND", "Usuário não encontrado.");
  const caps = planCapabilities(user.plan_id);

  // Assinatura precisa estar ativa para publicar
  if (!["active", "trialing"].includes(user.subscription_status)) {
    throw new HttpError(
      402,
      "SUBSCRIPTION_INACTIVE",
      "Sua assinatura não está ativa. Reative o plano para publicar o site.",
    );
  }

  if (body.custom_domain && !caps.customDomain) {
    throw new HttpError(
      403,
      "PLAN_REQUIRED",
      "Domínio próprio disponível apenas em planos pagos.",
    );
  }

  const finalSlug = await ensureUniqueSlug(slugify(body.slug), site.id);
  const updated = await prisma.site.update({
    where: { id: site.id },
    data: {
      slug: finalSlug,
      status: "published",
      published_url: body.custom_domain
        ? `https://${body.custom_domain}`
        : `/site/${finalSlug}`,
    },
  });
  res.json(updated);
});

router.post("/sites/:id/unpublish", async (req, res) => {
  const site = await getSiteOwned(req.params.id, req.user!.id, req.user!.role);
  const updated = await prisma.site.update({
    where: { id: site.id },
    data: { status: "ready", published_url: null },
  });
  res.json(updated);
});

async function ensureUniqueSlug(base: string, ignoreSiteId?: string): Promise<string> {
  const root = base || `site-${Date.now()}`;
  let candidate = root;
  let n = 1;
  while (true) {
    const found = await prisma.site.findUnique({ where: { slug: candidate } });
    if (!found || found.id === ignoreSiteId) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

export default router;
