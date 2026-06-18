/**
 * Endpoints — Projects
 * Mock hoje, HTTP amanhã (manter assinaturas).
 */

import { projectsApi } from "@/lib/api";
import { apiClient } from "../client";
import { toApiError, ApiError } from "../errors";
import type { Project, CreateProjectInput, UpdateProjectInput } from "../types";

export const projectsEndpoints = {
  async listProjects(userId: string): Promise<Project[]> {
    try {
      if (apiClient.isRemote) return apiClient.request<Project[]>("/projects", { query: { user_id: userId } });
      return await projectsApi.listForUser(userId);
    } catch (e) { throw toApiError(e); }
  },

  async getProjectById(id: string): Promise<Project> {
    try {
      const p = apiClient.isRemote
        ? await apiClient.request<Project>(`/projects/${id}`)
        : await projectsApi.get(id);
      if (!p) throw new ApiError("NOT_FOUND", "Projeto não encontrado.", 404);
      return p;
    } catch (e) { throw toApiError(e); }
  },

  async createProject(input: CreateProjectInput): Promise<Project> {
    try {
      if (apiClient.isRemote) return apiClient.request<Project>("/projects", { method: "POST", body: input });
      return await projectsApi.create({ ...input, template_id: input.template_id ?? null });
    } catch (e) { throw toApiError(e); }
  },


  async updateProject(id: string, patch: UpdateProjectInput): Promise<void> {
    try {
      if (apiClient.isRemote) {
        await apiClient.request<void>(`/projects/${id}`, { method: "PATCH", body: patch });
        return;
      }
      await projectsApi.update(id, patch);
    } catch (e) { throw toApiError(e); }
  },

  async deleteProject(id: string): Promise<void> {
    try {
      if (apiClient.isRemote) {
        await apiClient.request<void>(`/projects/${id}`, { method: "DELETE" });
        return;
      }
      await projectsApi.remove(id);
    } catch (e) { throw toApiError(e); }
  },

  async duplicateProject(id: string): Promise<Project> {
    try {
      if (apiClient.isRemote) return apiClient.request<Project>(`/projects/${id}/duplicate`, { method: "POST" });
      const original = await projectsApi.get(id);
      if (!original) throw new ApiError("NOT_FOUND", "Projeto não encontrado.", 404);
      const { id: _omit, created_at: _c, updated_at: _u, status: _s, ...rest } = original;
      return await projectsApi.create({ ...rest, title: `${original.title} (cópia)`, status: "draft" });
    } catch (e) { throw toApiError(e); }
  },
};
