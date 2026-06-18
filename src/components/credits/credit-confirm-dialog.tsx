/**
 * Modal de confirmação de gasto de créditos.
 * Mostra estimativa, saldo, plano, breakdown granular (tokens, multiplicadores
 * e regra de margem mínima) e bloqueia se faltar saldo ou se atingir o
 * limite diário do plano gratuito.
 */

import { useState } from "react";
import { Coins, Sparkles, AlertTriangle, X, Crown, ChevronDown, Info as InfoIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { EstimateBreakdown } from "@/lib/credits/pricing";
import { CREDIT_VALUE_BRL, MIN_MARGIN_MULTIPLIER, formatBRL } from "@/lib/credits/pricing";
import type { PlanId } from "@/lib/types";

interface Props {
  open: boolean;
  estimate: EstimateBreakdown | null;
  balance: number;
  planId: PlanId;
  freeDailyRemaining?: number | null;
  onCancel: () => void;
  onConfirm: () => void;
}

const PLAN_LABEL: Record<PlanId, string> = {
  start: "Start (gratuito)",
  pro: "Pro",
  business: "Business",
  full: "Publiciart Full",
};

export function CreditConfirmDialog({ open, estimate, balance, planId, freeDailyRemaining, onCancel, onConfirm }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  if (!open || !estimate) return null;
  const insufficient = balance < estimate.finalCredits;
  const dailyBlocked = planId === "start" && freeDailyRemaining !== null && freeDailyRemaining !== undefined && freeDailyRemaining <= 0;
  const blocked = insufficient || dailyBlocked;
  const marginSafe = estimate.marginRatio >= MIN_MARGIN_MULTIPLIER;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-border p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-brand">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Ação com IA
              </p>
              <h3 className="font-display text-lg font-semibold">{estimate.actionLabel}</h3>
            </div>
          </div>
          <button onClick={onCancel} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-xs text-muted-foreground">Esta ação pode consumir</p>
              <p className="font-display text-3xl font-extrabold text-brand">
                {estimate.finalCredits}
                <span className="ml-1 text-sm font-medium text-muted-foreground">créditos</span>
              </p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
              <span>Equivalente a {formatBRL(estimate.finalCredits * CREDIT_VALUE_BRL)}</span>
              <span className="text-right">Plano {PLAN_LABEL[planId]}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <Info label="Seu saldo" value={`${balance} créditos`} />
            <Info label="Após a ação" value={`${Math.max(0, balance - estimate.finalCredits)} créditos`} tone={insufficient ? "danger" : undefined} />
            <Info label="Mult. do plano" value={`x${estimate.planMultiplier}`} />
            <Info label="Complexidade" value={`x${estimate.complexityMultiplier.toFixed(2)}`} />
          </div>

          {/* Breakdown granular */}
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-dashed border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/40"
          >
            <span className="inline-flex items-center gap-1.5">
              <InfoIcon className="h-3.5 w-3.5" />
              Como esse valor foi calculado?
            </span>
            <ChevronDown className={`h-3.5 w-3.5 transition ${showDetails ? "rotate-180" : ""}`} />
          </button>

          {showDetails && (
            <div className="space-y-3 rounded-xl border border-border bg-surface/40 p-3 text-[11px]">
              <Row label="Tokens de entrada (estimado)" value={estimate.estimatedInputTokens.toLocaleString("pt-BR")} />
              <Row label="Tokens de saída (estimado)" value={estimate.estimatedOutputTokens.toLocaleString("pt-BR")} />
              <Row label="Custo estimado da IA" value={formatBRL(estimate.estimatedCostBRL)} />
              <Row label={`Margem mínima (x${MIN_MARGIN_MULTIPLIER})`} value={formatBRL(estimate.minimumChargeBRL)} />
              <div className="my-1 h-px bg-border" />
              <Row label="Cálculo base" value={`${estimate.baseCredits} créditos`} />
              <Row label="× multiplicador de plano" value={`x${estimate.planMultiplier}`} />
              <Row label="× complexidade" value={`x${estimate.complexityMultiplier.toFixed(2)}`} />
              <Row label="= Cobrado" value={`${estimate.finalCredits} créditos`} bold />
              <div className="my-1 h-px bg-border" />
              <Row label="Receita estimada" value={formatBRL(estimate.estimatedRevenueBRL)} />
              <Row
                label="Margem estimada"
                value={`${formatBRL(estimate.estimatedMarginBRL)} (x${estimate.marginRatio.toFixed(1)})`}
                tone={marginSafe ? "ok" : "warn"}
              />
              <p className="pt-1 text-[10px] leading-relaxed text-muted-foreground">
                Regra: cobramos no mínimo {MIN_MARGIN_MULTIPLIER}x o custo da chamada de IA + overhead operacional.
                O plano define quanto cada ação consome do saldo (Free queima x5 mais rápido para fins demonstrativos).
              </p>
            </div>
          )}

          {planId === "start" && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-200">
              No plano gratuito, os créditos são demonstrativos e possuem consumo acelerado.
              Faça upgrade para seus créditos renderem mais.
              {freeDailyRemaining !== null && freeDailyRemaining !== undefined && (
                <p className="mt-1 font-semibold">
                  Restam {freeDailyRemaining} ações de IA hoje.
                </p>
              )}
            </div>
          )}

          {blocked && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-300">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div>
                {dailyBlocked
                  ? "Você atingiu o limite diário de ações do plano gratuito. Volte amanhã ou faça upgrade."
                  : "Você não tem créditos suficientes para esta ação. Faça upgrade ou compre créditos extras."}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface/60 p-4">
          <button
            onClick={onCancel}
            className="rounded-md px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
          >
            Cancelar
          </button>
          {blocked ? (
            <Link
              to="/app/creditos"
              onClick={onCancel}
              className="inline-flex items-center gap-1 rounded-md bg-brand-gradient px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand/25"
            >
              <Crown className="h-3.5 w-3.5" />
              {dailyBlocked ? "Fazer upgrade" : "Comprar créditos"}
            </Link>
          ) : (
            <button
              onClick={onConfirm}
              className="inline-flex items-center gap-1 rounded-md bg-brand-gradient px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand/25"
            >
              <Coins className="h-3.5 w-3.5" />
              Confirmar e usar {estimate.finalCredits}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, tone }: { label: string; value: string; tone?: "danger" }) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 font-semibold ${tone === "danger" ? "text-red-500" : ""}`}>{value}</p>
    </div>
  );
}

function Row({ label, value, tone, bold }: { label: string; value: string; tone?: "ok" | "warn"; bold?: boolean }) {
  const toneCls = tone === "ok" ? "text-emerald-600 dark:text-emerald-300" : tone === "warn" ? "text-amber-600 dark:text-amber-300" : "";
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? "font-bold text-foreground" : "font-semibold"} ${toneCls}`}>{value}</span>
    </div>
  );
}
