import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../middleware/error.js";

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  title: z.string().min(1).max(120),
  business_name: z.string().min(1).max(120),
  segment: z.string().min(1).max(80),
  objective: z.string().max(280).default(""),
  template_id: z.string().nullable().optional(),
});
const updateSchema = createSchema.partial().extend({
  status: z
    .enum(["draft", "briefing_pending", "generating", "editing", "review", "published", "archived"])
    .optional(),
});

async function ensureOwn(id: string, userId: string, role: string) {
  const p = await prisma.project.findUnique({ where: { id } });
  if (!p) throw new HttpError(404, "NOT_FOUND", "Projeto não encontrado.");
  if (p.user_id !== userId && role !== "admin" && role !== "agency") {
    throw new HttpError(403, "FORBIDDEN", "Sem acesso a este projeto.");
  }
  return p;
}

router.get("/", async (req, res) => {
  const where = req.user!.role === "admin" ? {} : { user_id: req.user!.id };
  const list = await prisma.project.findMany({ where, orderBy: { updated_at: "desc" } });
  res.json(list);
});

router.get("/:id", async (req, res) => {
  const p = await ensureOwn(req.params.id, req.user!.id, req.user!.role);
  res.json(p);
});

router.post("/", validate(createSchema), async (req, res) => {
  const data = req.body as z.infer<typeof createSchema>;
  const created = await prisma.project.create({
    data: { ...data, template_id: data.template_id ?? null, user_id: req.user!.id },
  });
  res.status(201).json(created);
});

router.patch("/:id", validate(updateSchema), async (req, res) => {
  await ensureOwn(req.params.id, req.user!.id, req.user!.role);
  const updated = await prisma.project.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  await ensureOwn(req.params.id, req.user!.id, req.user!.role);
  await prisma.project.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

router.post("/:id/duplicate", async (req, res) => {
  const orig = await ensureOwn(req.params.id, req.user!.id, req.user!.role);
  const copy = await prisma.project.create({
    data: {
      user_id: req.user!.id,
      title: `${orig.title} (cópia)`,
      business_name: orig.business_name,
      segment: orig.segment,
      objective: orig.objective,
      template_id: orig.template_id,
      status: "draft",
    },
  });
  res.status(201).json(copy);
});

export default router;
