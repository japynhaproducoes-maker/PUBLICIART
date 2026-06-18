/**
 * Credit pricing engine — Publiciart Builder.
 *
 * Calcula crédito por ação garantindo margem mínima de 3x sobre o custo
 * estimado da chamada de IA. Multiplicadores por plano e por complexidade.
 *
 * Tudo client-side / mock-friendly. O backend real deve replicar a mesma
 * fórmula em /credits/estimate e /credits/consume.
 */

import type { PlanId } from "@/lib/types";

/** Valor base de 1 crédito em BRL — alinhado com pacotes (R$30 = 300c). */
export const CREDIT_VALUE_BRL = 0.1;

/** Margem mínima sobre o custo estimado. Regra de negócio: 3x. */
export const MIN_MARGIN_MULTIPLIER = 3;

/** Custo estimado por 1M tokens — proxy genérico em BRL. */
const COST_PER_M_INPUT_BRL = 2.5;
const COST_PER_M_OUTPUT_BRL = 7.5;
/** Overhead operacional por ação (infra, storage, logs). */
const OVERHEAD_BRL = 0.01;

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
  /** tokens de entrada base (briefing/contexto) */
  baseInputTokens: number;
  /** tokens de saída base (geração) */
  baseOutputTokens: number;
  /** dificuldade intrínseca da ação */
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

/**
 * Multiplicador por plano — define quanto cada plano "consome" do mesmo
 * trabalho. Free queima rápido (demonstrativo). Pago rende mais.
 */
export const PLAN_MULTIPLIER: Record<PlanId, number> = {
  start: 5, // Free / Start = demonstrativo, x5
  pro: 1.5,
  business: 1,
  full: 0.8,
};

/** Limite diário de ações de IA do plano gratuito. */
export const FREE_DAILY_ACTION_LIMIT = 8;

export interface EstimateInput {
  action: CreditActionType;
  planId: PlanId;
  /** Texto de prompt/briefing para estimar input. */
  promptText?: string;
  /** Nº de seções afetadas (sites maiores custam mais). */
  sections?: number;
  /** Anexos/assets considerados. */
  attachments?: number;
  /** Marcação de regeneração — encarece levemente. */
  isRegeneration?: boolean;
  /** Profundidade da análise (1 = básica, 3 = profunda). */
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
}

/** Heurística simples: 1 token ≈ 4 caracteres em PT-BR. */
function tokensFromText(text?: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export function estimateCredits(input: EstimateInput): EstimateBreakdown {
  const profile = ACTION_CATALOG[input.action];

  const promptTokens = tokensFromText(input.promptText);
  const estimatedInputTokens = Math.max(profile.baseInputTokens, profile.baseInputTokens + promptTokens);
  const sectionsBoost = Math.max(0, (input.sections ?? 0) - 4) * 350;
  const estimatedOutputTokens = profile.baseOutputTokens + sectionsBoost;

  const estimatedCostBRL =
    (estimatedInputTokens * COST_PER_M_INPUT_BRL + estimatedOutputTokens * COST_PER_M_OUTPUT_BRL) / 1_000_000 +
    OVERHEAD_BRL;

  const minimumChargeBRL = estimatedCostBRL * MIN_MARGIN_MULTIPLIER;
  const baseCredits = Math.ceil(minimumChargeBRL / CREDIT_VALUE_BRL);

  // Multiplicador de complexidade compõe vários fatores
  let complexity = profile.baseComplexity;
  if (input.isRegeneration) complexity *= 1.15;
  if (input.attachments && input.attachments > 0) complexity *= 1 + Math.min(0.4, input.attachments * 0.08);
  if (input.analysisDepth && input.analysisDepth > 1) complexity *= 1 + (input.analysisDepth - 1) * 0.15;
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
  };
}

/** Verifica se a cobrança planejada respeita a margem mínima. */
export function isMarginSafe(b: EstimateBreakdown): boolean {
  return b.estimatedRevenueBRL >= b.estimatedCostBRL * MIN_MARGIN_MULTIPLIER;
}

/* ============================================================
 * Top-up packs
 * ============================================================ */

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

/* ============================================================
 * Daily free credits — controle local (mock)
 * ============================================================ */

const DAILY_KEY = "publiciart.credits.daily.v1";

interface DailyState {
  date: string; // YYYY-MM-DD
  used: number; // ações de IA já feitas hoje
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function readDailyState(): DailyState {
  if (typeof window === "undefined") return { date: todayKey(), used: 0 };
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (!raw) return { date: todayKey(), used: 0 };
    const parsed = JSON.parse(raw) as DailyState;
    if (parsed.date !== todayKey()) return { date: todayKey(), used: 0 };
    return parsed;
  } catch {
    return { date: todayKey(), used: 0 };
  }
}

export function incrementDailyUsage(): DailyState {
  const next = { date: todayKey(), used: readDailyState().used + 1 };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DAILY_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return next;
}

export function freeDailyRemaining(planId: PlanId): number | null {
  if (planId !== "start") return null;
  return Math.max(0, FREE_DAILY_ACTION_LIMIT - readDailyState().used);
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}
