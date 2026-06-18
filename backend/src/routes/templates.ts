import { Router } from "express";
import { prisma } from "../db.js";
import { HttpError } from "../middleware/error.js";

const router = Router();

router.get("/", async (req, res) => {
  const segment = typeof req.query.segment === "string" ? req.query.segment : undefined;
  const where = segment ? { segment: { equals: segment, mode: "insensitive" as const } } : {};
  const list = await prisma.template.findMany({ where, orderBy: { name: "asc" } });
  res.json(list);
});

router.get("/:id", async (req, res) => {
  const t = await prisma.template.findUnique({ where: { id: req.params.id } });
  if (!t) throw new HttpError(404, "NOT_FOUND", "Template não encontrado.");
  res.json(t);
});

export default router;
