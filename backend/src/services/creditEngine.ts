/**
 * Credit Margin Engine — backend (Publiciart Builder).
 *
 * Espelha a engine do frontend (src/lib/credits/pricing.ts) para garantir
 * que a regra de margem mínima 3x exista no servidor — fonte de verdade.
 *
 * Fórmula:
 *   estimatedCostBRL = tokens * preço + overhead
 *   minimumChargeBRL = estimatedCostBRL * 3
 *   baseCredits      = ceil(minimumChargeBRL / creditValueBRL)
 *   finalCredits     = ceil(baseCredits * planMultiplier * complexityMultiplier)
 */

import type { PlanId } from "@prisma/client";

export const CREDIT_VALUE_BRL = 0.1;
export const MIN_MARGIN_MULTIPLIER = 3;

const COST_PER_M_INPUT_BRL = 2.5;
const COST_PER_M_OUTPUT_BRL = 7.5;
const OVERHEAD_BRL = 0.01;

export const FREE_DAILY_ACTION_LIMIT = 8;

export type CreditActionType =
  | "strategic_analysis"
  | "generate_brd"
  | "generate_site"
  | "regen_section"
  | "improve_copy"
  | "create_variations"
  | "generate_seo"
  | "sales_page"
  | "change_style"
  | "campaign"
  | "generate_faq"
  | "offer_structure";

interface ActionProfile {
  label: string;
  baseInputTokens: number;
  baseOutputTokens: number;
  baseComplexity: number;
}

export const ACTION_CATALOG: Record<CreditActionType, ActionProfile> = {
  strategic_analysis: { label: "Análise estratégica", baseInputTokens: 600, baseOutputTokens: 1500, baseComplexity: 1.2 },
  generate_brd: { label: "BRD / PRD do site", baseInputTokens: 900, baseOutputTokens: 2500, baseComplexity: 1.3 },
  generate_site: { label: "Gerar site completo", baseInputTokens: 1200, baseOutputTokens: 4200, baseComplexity: 1.5 },
  regen_section: { label: "Regerar seção", baseInputTokens: 250, baseOutputTokens: 850, baseComplexity: 0.9 },
  improve_copy: { label: "Melhorar copy", baseInputTokens: 150, baseOutputTokens: 350, baseComplexity: 0.7 },
  create_variations: { label: "Criar variações", baseInputTokens: 250, baseOutputTokens: 950, baseComplexity: 1 },
  generate_seo: { label: "Gerar SEO", baseInputTokens: 300, baseOutputTokens: 800, baseComplexity: 0.9 },
  sales_page: { label: "Página de vendas", baseInputTokens: 1100, baseOutputTokens: 3600, baseComplexity: 1.4 },
  change_style: { label: "Trocar estilo visual", baseInputTokens: 120, baseOutputTokens: 400, baseComplexity: 0.6 },
  campaign: { label: "Criar campanha", baseInputTokens: 700, baseOutputTokens: 2200, baseComplexity: 1.2 },
  generate_faq: { label: "Gerar FAQ", baseInputTokens: 350, baseOutputTokens: 1100, baseComplexity: 0.8 },
  offer_structure: { label: "Estruturar oferta", baseInputTokens: 600, baseOutputTokens: 1600, baseComplexity: 1.1 },
};

export const PLAN_MULTIPLIER: Record<PlanId, number> = {
  start: 5,
  pro: 1.5,
  business: 1,
  full: 0.8,
};

export interface EstimateInput {
  action: CreditActionType;
  planId: PlanId;
  promptText?: string;
  sections?: number;
  attachments?: number;
  isRegeneration?: boolean;
  analysisDepth?: number;
}

export interface EstimateBreakdown {
  action: CreditActionType;
  actionLabel: string;
  planId: PlanId;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedCostBRL: number;
  minimumChargeBRL: number;
  baseCredits: number;
  planMultiplier: number;
  complexityMultiplier: number;
  finalCredits: number;
  estimatedRevenueBRL: number;
  estimatedMarginBRL: number;
  marginRatio: number;
  creditValueBRL: number;
}

function tokensFromText(text?: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export function estimateCredits(input: EstimateInput): EstimateBreakdown {
  const profile = ACTION_CATALOG[input.action];
  if (!profile) throw new Error(`Ação de crédito desconhecida: ${input.action}`);

  const promptTokens = tokensFromText(input.promptText);
  const estimatedInputTokens = Math.max(
    profile.baseInputTokens,
    profile.baseInputTokens + promptTokens,
  );
  const sectionsBoost = Math.max(0, (input.sections ?? 0) - 4) * 350;
  const estimatedOutputTokens = profile.baseOutputTokens + sectionsBoost;

  const estimatedCostBRL =
    (estimatedInputTokens * COST_PER_M_INPUT_BRL +
      estimatedOutputTokens * COST_PER_M_OUTPUT_BRL) /
      1_000_000 +
    OVERHEAD_BRL;

  const minimumChargeBRL = estimatedCostBRL * MIN_MARGIN_MULTIPLIER;
  const baseCredits = Math.ceil(minimumChargeBRL / CREDIT_VALUE_BRL);

  let complexity = profile.baseComplexity;
  if (input.isRegeneration) complexity *= 1.15;
  if (input.attachments && input.attachments > 0)
    complexity *= 1 + Math.min(0.4, input.attachments * 0.08);
  if (input.analysisDepth && input.analysisDepth > 1)
    complexity *= 1 + (input.analysisDepth - 1) * 0.15;
  if (promptTokens > 400) complexity *= 1.1;

  const planMultiplier = PLAN_MULTIPLIER[input.planId] ?? 1;
  const finalCredits = Math.max(1, Math.ceil(baseCredits * planMultiplier * complexity));

  const estimatedRevenueBRL = finalCredits * CREDIT_VALUE_BRL;
  const estimatedMarginBRL = estimatedRevenueBRL - estimatedCostBRL;
  const marginRatio = estimatedRevenueBRL / Math.max(0.0001, estimatedCostBRL);

  return {
    action: input.action,
    actionLabel: profile.label,
    planId: input.planId,
    estimatedInputTokens,
    estimatedOutputTokens,
    estimatedCostBRL,
    minimumChargeBRL,
    baseCredits,
    planMultiplier,
    complexityMultiplier: Number(complexity.toFixed(3)),
    finalCredits,
    estimatedRevenueBRL,
    estimatedMarginBRL,
    marginRatio,
    creditValueBRL: CREDIT_VALUE_BRL,
  };
}

/** Regra de proteção de margem: revenue >= cost * 3. */
export function isMarginSafe(b: EstimateBreakdown): boolean {
  return b.estimatedRevenueBRL >= b.estimatedCostBRL * MIN_MARGIN_MULTIPLIER;
}

export interface CreditPack {
  id: string;
  priceBRL: number;
  credits: number;
  label: string;
  highlight?: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: "pack-30", priceBRL: 30, credits: 300, label: "Recarga rápida" },
  { id: "pack-50", priceBRL: 50, credits: 550, label: "Mais usado", highlight: true },
  { id: "pack-100", priceBRL: 100, credits: 1200, label: "Power user" },
  { id: "pack-200", priceBRL: 200, credits: 2600, label: "Agência" },
];

export function pricingRules() {
  return {
    creditValueBRL: CREDIT_VALUE_BRL,
    minMarginMultiplier: MIN_MARGIN_MULTIPLIER,
    overheadBRL: OVERHEAD_BRL,
    costPerMillionInputBRL: COST_PER_M_INPUT_BRL,
    costPerMillionOutputBRL: COST_PER_M_OUTPUT_BRL,
    freeDailyActionLimit: FREE_DAILY_ACTION_LIMIT,
    planMultipliers: PLAN_MULTIPLIER,
    actionCatalog: ACTION_CATALOG,
    packs: CREDIT_PACKS,
  };
}
