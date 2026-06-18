import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../middleware/error.js";

const router = Router();
router.use(requireAuth);

const briefingSchema = z.object({
  business_name: z.string().min(1),
  segment: z.string().min(1),
  city: z.string().default(""),
  target_audience: z.string().default(""),
  main_offer: z.string().default(""),
  services: z.array(z.string()).default([]),
  whatsapp: z.string().default(""),
  instagram: z.string().default(""),
  visual_style: z.string().default(""),
  goal: z.string().default(""),
  notes: z.string().default(""),
});

async function checkProject(id: string, userId: string, role: string) {
  const p = await prisma.project.findUnique({ where: { id } });
  if (!p) throw new HttpError(404, "NOT_FOUND", "Projeto não encontrado.");
  if (p.user_id !== userId && role !== "admin") {
    throw new HttpError(403, "FORBIDDEN", "Sem acesso.");
  }
}

// GET /projects/:id/briefing
router.get("/projects/:id/briefing", async (req, res) => {
  await checkProject(req.params.id, req.user!.id, req.user!.role);
  const briefing = await prisma.briefing.findUnique({ where: { project_id: req.params.id } });
  res.json(briefing);
});

// POST /projects/:id/briefing — upsert
router.post("/projects/:id/briefing", validate(briefingSchema), async (req, res) => {
  await checkProject(req.params.id, req.user!.id, req.user!.role);
  const data = req.body as z.infer<typeof briefingSchema>;
  const saved = await prisma.briefing.upsert({
    where: { project_id: req.params.id },
    update: data,
    create: { ...data, project_id: req.params.id },
  });
  res.status(201).json(saved);
});

// PATCH /briefings/:id
router.patch("/briefings/:id", validate(briefingSchema.partial()), async (req, res) => {
  const briefing = await prisma.briefing.findUnique({
    where: { id: req.params.id },
    include: { project: true },
  });
  if (!briefing) throw new HttpError(404, "NOT_FOUND", "Briefing não encontrado.");
  if (briefing.project.user_id !== req.user!.id && req.user!.role !== "admin") {
    throw new HttpError(403, "FORBIDDEN", "Sem acesso.");
  }
  const updated = await prisma.briefing.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
});

export default router;
