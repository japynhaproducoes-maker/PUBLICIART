/**
 * Endpoints — Plans
 */

import { plansApi, authApi } from "@/lib/api";
import { apiClient } from "../client";
import { ApiError, toApiError } from "../errors";
import type { Plan, PlanId } from "../types";

export const plansEndpoints = {
  async listPlans(): Promise<Plan[]> {
    try {
      if (apiClient.isRemote) return apiClient.request<Plan[]>("/plans");
      return await plansApi.list();
    } catch (e) { throw toApiError(e); }
  },

  async getCurrentPlan(): Promise<Plan | null> {
    try {
      const user = authApi.getCurrentUser();
      if (!user) return null;
      if (apiClient.isRemote) return apiClient.request<Plan>("/plans/current");
      return await plansApi.get(user.plan_id);
    } catch (e) { throw toApiError(e); }
  },

  /** Upgrade mockado — no backend real envolverá checkout (Stripe/MP). */
  async upgradePlan(userId: string, planId: PlanId): Promise<void> {
    try {
      if (apiClient.isRemote) {
        await apiClient.request<void>("/plans/upgrade", {
          method: "POST",
          body: { user_id: userId, plan_id: planId },
        });
        return;
      }
      await plansApi.changePlan(userId, planId);
    } catch (e) {
      throw e instanceof ApiError ? e : toApiError(e);
    }
  },
};
