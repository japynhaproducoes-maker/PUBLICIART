import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../middleware/error.js";
import { planCapabilities } from "../services/planCapabilities.js";

const router = Router();

router.get("/", async (_req, res) => {
  const list = await prisma.plan.findMany();
  res.json(list);
});

router.get("/current", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw new HttpError(404, "NOT_FOUND", "Usuário não encontrado.");
  const plan = await prisma.plan.findUnique({ where: { id: user.plan_id } });
  res.json({
    plan,
    subscription_status: user.subscription_status,
    capabilities: planCapabilities(user.plan_id),
  });
});

const upgradeSchema = z.object({
  plan_id: z.enum(["start", "pro", "business", "full"]),
});
router.post("/upgrade", requireAuth, validate(upgradeSchema), async (req, res) => {
  // TODO: integrar gateway de pagamento. Hoje: marca como trialing.
  const { plan_id } = req.body as z.infer<typeof upgradeSchema>;
  const updated = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      plan_id,
      subscription_status: plan_id === "start" ? "active" : "trialing",
    },
  });
  res.json({
    ok: true,
    plan_id: updated.plan_id,
    subscription_status: updated.subscription_status,
    capabilities: planCapabilities(updated.plan_id),
  });
});

export default router;
