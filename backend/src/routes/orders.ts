import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../middleware/error.js";

const router = Router();

const orderCreate = z.object({
  project_id: z.string().nullable().optional(),
  service_type: z.enum([
    "logo", "identidade_visual", "artes_instagram", "video", "jingle",
    "pagina_vendas", "trafego", "manutencao", "ensaio_fotos", "pacote_completo",
  ]),
  service_label: z.string().min(1).max(120),
  price: z.number().int().min(0),
  notes: z.string().max(2000).default(""),
});

const statusSchema = z.object({
  status: z.enum([
    "requested", "analyzing", "quoted", "approved",
    "in_production", "in_review", "delivered", "cancelled",
  ]),
  quoted_price: z.number().int().min(0).optional(),
  admin_notes: z.string().max(2000).optional(),
});

router.get("/", requireAuth, async (req, res) => {
  const list = await prisma.order.findMany({
    where: { user_id: req.user!.id },
    orderBy: { created_at: "desc" },
  });
  res.json(list);
});

router.post("/", requireAuth, validate(orderCreate), async (req, res) => {
  const data = req.body as z.infer<typeof orderCreate>;
  if (data.project_id) {
    const p = await prisma.project.findUnique({ where: { id: data.project_id } });
    if (!p || p.user_id !== req.user!.id) {
      throw new HttpError(403, "FORBIDDEN", "Projeto inválido.");
    }
  }
  const created = await prisma.order.create({
    data: {
      user_id: req.user!.id,
      project_id: data.project_id ?? null,
      service_type: data.service_type,
      service_label: data.service_label,
      price: data.price,
      notes: data.notes,
    },
  });
  res.status(201).json(created);
});

router.patch("/:id/status", requireAuth, requireRole("admin"), validate(statusSchema), async (req, res) => {
  const data = req.body as z.infer<typeof statusSchema>;
  const updated = await prisma.order.update({ where: { id: req.params.id }, data });
  res.json(updated);
});

// Admin lista todos
export const adminRouter = Router();
adminRouter.get("/orders", requireAuth, requireRole("admin"), async (_req, res) => {
  const list = await prisma.order.findMany({ orderBy: { created_at: "desc" } });
  res.json(list);
});

export default router;
