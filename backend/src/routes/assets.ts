import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { uploadObject, deleteObject } from "../services/storage.js";
import { config } from "../config.js";

const router = Router();
router.use(requireAuth);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

const typeSchema = z.enum(["image", "video", "logo", "document"]);

router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) throw new HttpError(422, "VALIDATION", "Arquivo ausente (campo 'file').");
  const type = typeSchema.parse(req.body.type ?? "image");
  const projectId = (req.body.project_id as string | undefined) || null;

  if (projectId) {
    const p = await prisma.project.findUnique({ where: { id: projectId } });
    if (!p || p.user_id !== req.user!.id) throw new HttpError(403, "FORBIDDEN", "Projeto inválido.");
  }

  const key = `users/${req.user!.id}/${randomUUID()}-${req.file.originalname}`;
  let url = key;
  if (config.s3.bucket) {
    url = await uploadObject(key, req.file.buffer, req.file.mimetype);
  } else {
    // Sem S3 configurado: salva como data URL (apenas dev).
    url = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  }

  const asset = await prisma.asset.create({
    data: {
      user_id: req.user!.id,
      project_id: projectId,
      type,
      url,
      name: req.file.originalname,
    },
  });
  res.status(201).json(asset);
});

router.get("/", async (req, res) => {
  const projectId = typeof req.query.project_id === "string" ? req.query.project_id : undefined;
  const where: Record<string, unknown> = { user_id: req.user!.id };
  if (projectId) where.project_id = projectId;
  const list = await prisma.asset.findMany({ where, orderBy: { created_at: "desc" } });
  res.json(list);
});

router.delete("/:id", async (req, res) => {
  const asset = await prisma.asset.findUnique({ where: { id: req.params.id } });
  if (!asset) throw new HttpError(404, "NOT_FOUND", "Asset não encontrado.");
  if (asset.user_id !== req.user!.id && req.user!.role !== "admin") {
    throw new HttpError(403, "FORBIDDEN", "Sem acesso.");
  }
  if (config.s3.bucket && asset.url.startsWith("http")) {
    const key = asset.url.split("/").slice(-3).join("/");
    await deleteObject(key).catch(() => null);
  }
  await prisma.asset.delete({ where: { id: asset.id } });
  res.status(204).end();
});

export default router;
