/**
 * Endpoints — Templates
 */

import { templatesApi } from "@/lib/api";
import { apiClient } from "../client";
import { ApiError, toApiError } from "../errors";
import type { Template } from "../types";

export const templatesEndpoints = {
  async listTemplates(): Promise<Template[]> {
    try {
      if (apiClient.isRemote) return apiClient.request<Template[]>("/templates");
      return await templatesApi.list();
    } catch (e) { throw toApiError(e); }
  },

  async getTemplateById(id: string): Promise<Template> {
    try {
      if (apiClient.isRemote) return apiClient.request<Template>(`/templates/${id}`);
      const all = await templatesApi.list();
      const t = all.find((x) => x.id === id);
      if (!t) throw new ApiError("NOT_FOUND", "Template não encontrado.", 404);
      return t;
    } catch (e) { throw toApiError(e); }
  },

  async listTemplatesBySegment(segment: string): Promise<Template[]> {
    try {
      if (apiClient.isRemote)
        return apiClient.request<Template[]>("/templates", { query: { segment } });
      return await templatesApi.listBySegment(segment);
    } catch (e) { throw toApiError(e); }
  },
};
