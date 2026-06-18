/**
 * Endpoints — Credits.
 *
 * Camada que decide entre backend real (VITE_API_BASE_URL) e mock local.
 * No backend, a engine de margem é a fonte de verdade — o frontend só
 * apresenta o breakdown.
 */

import { creditsApi, authApi } from "@/lib/api";
import { apiClient } from "../client";
import { ApiError, toApiError } from "../errors";
import type { CreditTransaction } from "../types";
import { estimateCredits, type CreditActionType, type EstimateBreakdown } from "@/lib/credits/pricing";

export interface ConsumeActionPayload {
  action: CreditActionType;
  prompt_text?: string;
  sections?: number;
  attachments?: number;
  is_regeneration?: boolean;
  analysis_depth?: number;
  project_id?: string;
  description?: string;
}

export const creditsEndpoints = {
  async getCreditBalance(userId: string): Promise<number> {
    try {
      if (apiClient.isRemote)
        return (await apiClient.request<{ balance: number }>(`/credits/balance`)).balance;
      const current = authApi.getCurrentUser();
      if (current?.id === userId) return current.credits_balance;
      return 0;
    } catch (e) { throw toApiError(e); }
  },

  async listCreditTransactions(userId: string): Promise<CreditTransaction[]> {
    try {
      if (apiClient.isRemote)
        return apiClient.request<CreditTransaction[]>(`/credits/transactions`);
      return await creditsApi.listTxForUser(userId);
    } catch (e) { throw toApiError(e); }
  },

  async estimate(payload: ConsumeActionPayload): Promise<{
    breakdown: EstimateBreakdown;
    balance: number;
    sufficient: boolean;
    margin_safe: boolean;
  }> {
    try {
      if (apiClient.isRemote) {
        return apiClient.request(`/credits/estimate`, { method: "POST", body: payload });
      }
      const current = authApi.getCurrentUser();
      const breakdown = estimateCredits({
        action: payload.action,
        planId: current?.plan_id ?? "start",
        promptText: payload.prompt_text,
        sections: payload.sections,
        attachments: payload.attachments,
        isRegeneration: payload.is_regeneration,
        analysisDepth: payload.analysis_depth,
      });
      const balance = current?.credits_balance ?? 0;
      return {
        breakdown,
        balance,
        sufficient: balance >= breakdown.finalCredits,
        margin_safe: breakdown.estimatedRevenueBRL >= breakdown.estimatedCostBRL * 3,
      };
    } catch (e) { throw toApiError(e); }
  },

  async consumeAction(payload: ConsumeActionPayload): Promise<{
    balance: number;
    breakdown: EstimateBreakdown;
  }> {
    try {
      if (apiClient.isRemote) {
        return apiClient.request(`/credits/consume-action`, { method: "POST", body: payload });
      }
      const current = authApi.getCurrentUser();
      if (!current) throw new ApiError("UNAUTHORIZED", "Sessão expirada.", 401);
      const est = await this.estimate(payload);
      if (!est.sufficient) throw new ApiError("INSUFFICIENT_CREDITS", "Créditos insuficientes.", 402);
      const result = await creditsApi.consumeForAction({
        userId: current.id,
        action: payload.action,
        estimate: est.breakdown,
        description: payload.description ?? `Ação IA: ${est.breakdown.actionLabel}`,
        projectId: payload.project_id ?? null,
        promptSize: payload.prompt_text?.length ?? 0,
      });
      if (!result.ok) throw new ApiError("INSUFFICIENT_CREDITS", result.reason ?? "Falha ao consumir.", 402);
      return { balance: result.remaining, breakdown: est.breakdown };
    } catch (e) { throw toApiError(e); }
  },

  async getPricingRules(): Promise<unknown> {
    try {
      if (apiClient.isRemote) return apiClient.request(`/credits/pricing-rules`);
      const { pricingRulesMock } = await import("@/lib/credits/pricing-rules-mock");
      return pricingRulesMock();
    } catch (e) { throw toApiError(e); }
  },

  async topUp(packId: string): Promise<{ balance: number }> {
    try {
      if (apiClient.isRemote) {
        return apiClient.request(`/credits/top-up`, { method: "POST", body: { pack_id: packId } });
      }
      const current = authApi.getCurrentUser();
      if (!current) throw new ApiError("UNAUTHORIZED", "Sessão expirada.", 401);
      const { CREDIT_PACKS } = await import("@/lib/credits/pricing");
      const pack = CREDIT_PACKS.find((p) => p.id === packId);
      if (!pack) throw new ApiError("NOT_FOUND", "Pacote inválido.", 404);
      const balance = await creditsApi.topUp(current.id, pack.credits, pack.priceBRL, pack.label);
      return { balance };
    } catch (e) { throw toApiError(e); }
  },
};
