import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../middleware/error.js";
import {
  ACTION_CATALOG,
  CREDIT_PACKS,
  FREE_DAILY_ACTION_LIMIT,
  estimateCredits,
  isMarginSafe,
  pricingRules,
  type CreditActionType,
} from "../services/creditEngine.js";

const router = Router();

/** Catálogo público — usado pelo frontend para montar UI sem chamar /auth. */
router.get("/pricing-rules", (_req, res) => res.json(pricingRules()));

router.use(requireAuth);

router.get("/balance", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { credits_balance: true },
  });
  res.json({ balance: user?.credits_balance ?? 0 });
});

router.get("/transactions", async (req, res) => {
  const tx = await prisma.creditTransaction.findMany({
    where: { user_id: req.user!.id },
    orderBy: { created_at: "desc" },
    take: 100,
  });
  res.json(tx);
});

const actionEnum = z.enum(Object.keys(ACTION_CATALOG) as [CreditActionType, ...CreditActionType[]]);

const estimateSchema = z.object({
  action: actionEnum,
  prompt_text: z.string().max(20_000).optional(),
  sections: z.number().int().min(0).max(50).optional(),
  attachments: z.number().int().min(0).max(50).optional(),
  is_regeneration: z.boolean().optional(),
  analysis_depth: z.number().int().min(1).max(5).optional(),
  project_id: z.string().optional(),
});

router.post("/estimate", validate(estimateSchema), async (req, res) => {
  const body = req.body as z.infer<typeof estimateSchema>;
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw new HttpError(404, "NOT_FOUND", "Usuário não encontrado.");

  const breakdown = estimateCredits({
    action: body.action,
    planId: user.plan_id,
    promptText: body.prompt_text,
    sections: body.sections,
    attachments: body.attachments,
    isRegeneration: body.is_regeneration,
    analysisDepth: body.analysis_depth,
  });

  res.json({
    breakdown,
    balance: user.credits_balance,
    sufficient: user.credits_balance >= breakdown.finalCredits,
    margin_safe: isMarginSafe(breakdown),
  });
});

const consumeSchema = estimateSchema.extend({
  description: z.string().min(1).max(200).optional(),
});

router.post("/consume-action", validate(consumeSchema), async (req, res) => {
  const body = req.body as z.infer<typeof consumeSchema>;
  const result = await runConsumeAction(req.user!.id, body);
  res.json(result);
});

const topUpSchema = z.object({ pack_id: z.string().min(1) });
router.post("/top-up", validate(topUpSchema), async (req, res) => {
  const { pack_id } = req.body as z.infer<typeof topUpSchema>;
  const pack = CREDIT_PACKS.find((p) => p.id === pack_id);
  if (!pack) throw new HttpError(404, "NOT_FOUND", "Pacote inválido.");

  // TODO: integrar gateway (Stripe/Mercado Pago). Por ora, crédito direto.
  const updated = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: req.user!.id },
      data: { credits_balance: { increment: pack.credits } },
    });
    await tx.creditTransaction.create({
      data: {
        user_id: req.user!.id,
        amount: pack.credits,
        type: "purchase",
        description: `Recarga ${pack.label} (${pack.credits} créditos / R$ ${pack.priceBRL})`,
        metadata: { pack_id: pack.id, price_brl: pack.priceBRL },
      },
    });
    return user;
  });
  res.json({ balance: updated.credits_balance, pack });
});

/* ============================================================
 * Helpers reutilizáveis (também usados em /sites generate)
 * ============================================================ */

export interface ConsumeActionInput {
  action: CreditActionType;
  prompt_text?: string;
  sections?: number;
  attachments?: number;
  is_regeneration?: boolean;
  analysis_depth?: number;
  project_id?: string;
  description?: string;
}

export async function runConsumeAction(userId: string, body: ConsumeActionInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new HttpError(404, "NOT_FOUND", "Usuário não encontrado.");

  // Limite diário para plano grátis
  if (user.plan_id === "start") {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const usedToday = await prisma.creditTransaction.count({
      where: { user_id: userId, type: "consumption", created_at: { gte: since } },
    });
    if (usedToday >= FREE_DAILY_ACTION_LIMIT) {
      throw new HttpError(
        429,
        "DAILY_LIMIT_REACHED",
        `Limite diário do plano grátis (${FREE_DAILY_ACTION_LIMIT} ações) atingido. Faça upgrade para continuar.`,
      );
    }
  }

  const breakdown = estimateCredits({
    action: body.action,
    planId: user.plan_id,
    promptText: body.prompt_text,
    sections: body.sections,
    attachments: body.attachments,
    isRegeneration: body.is_regeneration,
    analysisDepth: body.analysis_depth,
  });

  if (!isMarginSafe(breakdown)) {
    throw new HttpError(
      409,
      "MARGIN_UNSAFE",
      "Esta ação não respeita a margem mínima (3x). Ajuste a regra de preços.",
    );
  }

  if (user.credits_balance < breakdown.finalCredits) {
    throw new HttpError(402, "INSUFFICIENT_CREDITS", "Créditos insuficientes.");
  }

  const description = body.description ?? `Ação IA: ${breakdown.actionLabel}`;

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: { credits_balance: { decrement: breakdown.finalCredits } },
    });
    const txn = await tx.creditTransaction.create({
      data: {
        user_id: userId,
        amount: -breakdown.finalCredits,
        type: "consumption",
        description,
        metadata: {
          action_type: breakdown.action,
          project_id: body.project_id ?? null,
          prompt_size: body.prompt_text?.length ?? 0,
          estimated_input_tokens: breakdown.estimatedInputTokens,
          estimated_output_tokens: breakdown.estimatedOutputTokens,
          estimated_cost_brl: Number(breakdown.estimatedCostBRL.toFixed(6)),
          charged_credits: breakdown.finalCredits,
          credit_value_brl: breakdown.creditValueBRL,
          estimated_revenue_brl: Number(breakdown.estimatedRevenueBRL.toFixed(4)),
          estimated_margin_brl: Number(breakdown.estimatedMarginBRL.toFixed(4)),
          plan_multiplier: breakdown.planMultiplier,
          complexity_multiplier: breakdown.complexityMultiplier,
        },
      },
    });
    return { balance: updated.credits_balance, transaction_id: txn.id };
  });

  return { ...result, breakdown };
}

export default router;
