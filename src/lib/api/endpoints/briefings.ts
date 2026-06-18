/**
 * Endpoints — Briefings
 */

import { briefingsApi } from "@/lib/api";
import { apiClient } from "../client";
import { toApiError } from "../errors";
import type { Briefing, SaveBriefingInput } from "../types";

export const briefingsEndpoints = {
  async getBriefingByProjectId(projectId: string): Promise<Briefing | null> {
    try {
      if (apiClient.isRemote)
        return apiClient.request<Briefing | null>(`/projects/${projectId}/briefing`);
      return await briefingsApi.getForProject(projectId);
    } catch (e) { throw toApiError(e); }
  },

  async saveBriefing(input: SaveBriefingInput): Promise<void> {
    try {
      if (apiClient.isRemote) {
        await apiClient.request<void>(`/projects/${input.project_id}/briefing`, {
          method: "PUT",
          body: input,
        });
        return;
      }
      await briefingsApi.save(input);
    } catch (e) { throw toApiError(e); }
  },

  /** Alias semântico — patch parcial sobre o briefing existente. */
  async updateBriefing(input: SaveBriefingInput): Promise<void> {
    return this.saveBriefing(input);
  },
};
