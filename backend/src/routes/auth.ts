import { Router } from "express";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../db.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { HttpError } from "../middleware/error.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { config } from "../config.js";
import { emailService } from "../services/emailService.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(120),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

const forgotSchema = z.object({
  email: z.string().email().toLowerCase(),
});

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(120),
});

router.post("/register", validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.body as z.infer<typeof registerSchema>;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new HttpError(409, "CONFLICT", "E-mail já cadastrado.");
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password_hash: await hashPassword(password),
      credits_balance: 30,
      credit_tx: {
        create: { amount: 30, type: "monthly_grant", description: "Boas-vindas — créditos grátis" },
      },
    },
  });
  const token = signToken({ sub: user.id, role: user.role });
  res.status(201).json({ token, user: sanitize(user) });
});

router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new HttpError(401, "UNAUTHORIZED", "Credenciais inválidas.");
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) throw new HttpError(401, "UNAUTHORIZED", "Credenciais inválidas.");
  const token = signToken({ sub: user.id, role: user.role });
  res.json({ token, user: sanitize(user) });
});

// Stateless JWT — logout é client-side (remover token).
router.post("/logout", (_req, res) => res.status(204).end());

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw new HttpError(404, "NOT_FOUND", "Usuário não encontrado.");
  res.json(sanitize(user));
});

/**
 * Forgot password — sempre responde 204, sem revelar se o e-mail existe.
 * Cria um token aleatório (32 bytes), grava o hash, e envia o link por e-mail.
 * Em dev sem SMTP, o emailService loga o link no console.
 */
router.post("/forgot-password", validate(forgotSchema), async (req, res) => {
  const { email } = req.body as z.infer<typeof forgotSchema>;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await prisma.passwordResetToken.create({
      data: { user_id: user.id, token_hash: tokenHash, expires_at: expiresAt },
    });
    const link = `${config.appUrl}/resetar-senha?token=${rawToken}`;
    try {
      await emailService.sendPasswordReset(user.email, link);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[forgot-password] falha ao enviar e-mail:", err);
      // eslint-disable-next-line no-console
      console.info(`[forgot-password] link manual para ${user.email}: ${link}`);
    }
  }
  res.status(204).end();
});

router.post("/reset-password", validate(resetSchema), async (req, res) => {
  const { token, password } = req.body as z.infer<typeof resetSchema>;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({ where: { token_hash: tokenHash } });
  if (!record || record.used_at || record.expires_at < new Date()) {
    throw new HttpError(400, "INVALID_TOKEN", "Link inválido ou expirado.");
  }
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.user_id },
      data: { password_hash: await hashPassword(password) },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used_at: new Date() },
    }),
  ]);
  res.status(204).end();
});

function sanitize<T extends { password_hash: string }>(u: T) {
  const { password_hash: _omit, ...rest } = u;
  return rest;
}

export default router;
