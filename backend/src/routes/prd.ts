/**
 * PRD Routes — Publiciart Builder
 *
 * POST /projects/:id/prd/analyze  → squads analisam briefing e salvam PRD
 * GET  /projects/:id/prd          → retorna PRD salvo
 * POST /projects/:id/prd/approve  → cliente aprova, libera geração do site
 */

import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { analyzeWithSquads } from "../services/squadAnalyzer.js";
import type { BriefingInput } from "../services/squadAnalyzer.js";

const router = Router();
router.use(requireAuth);

async function checkProject(projectId: string, userId: string, role: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new HttpError(404, "NOT_FOUND", "Projeto não encontrado.");
  if (project.user_id !== userId && role !== "admin") {
    throw new HttpError(403, "FORBIDDEN", "Sem acesso a este projeto.");
  }
  return project;
}

// POST /projects/:id/prd/analyze
router.post("/projects/:id/prd/analyze", async (req, res) => {
  const { id } = req.params;
  await checkProject(id, req.user!.id, req.user!.role);

  const briefing = await prisma.briefing.findUnique({ where: { project_id: id } });
  if (!briefing) throw new HttpError(400, "NO_BRIEFING", "Preencha o briefing antes de analisar.");

  const input: BriefingInput = {
    business_name: briefing.business_name,
    segment: briefing.segment,
    city: briefing.city,
    main_offer: briefing.main_offer,
    target_audience: briefing.target_audience,
    visual_style: briefing.visual_style,
    goal: briefing.goal,
    services: briefing.services,
    notes: briefing.notes,
    instagram: briefing.instagram,
    whatsapp: briefing.whatsapp,
  };

  const analysis = await analyzeWithSquads(input);

  const updated = await prisma.project.update({
    where: { id },
    data: { prd_data: analysis as object, prd_approved: false, status: "review" },
  });

  res.json({ project: updated, prd: analysis });
});

// GET /projects/:id/prd
router.get("/projects/:id/prd", async (req, res) => {
  const { id } = req.params;
  await checkProject(id, req.user!.id, req.user!.role);

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project?.prd_data) throw new HttpError(404, "NO_PRD", "PRD ainda não gerado.");

  res.json({ prd: project.prd_data, approved: project.prd_approved });
});

// POST /projects/:id/prd/approve
router.post("/projects/:id/prd/approve", async (req, res) => {
  const { id } = req.params;
  await checkProject(id, req.user!.id, req.user!.role);

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project?.prd_data) throw new HttpError(400, "NO_PRD", "Gere o PRD antes de aprovar.");

  await prisma.project.update({
    where: { id },
    data: { prd_approved: true, status: "generating" },
  });

  res.json({ ok: true });
});

export default router;
