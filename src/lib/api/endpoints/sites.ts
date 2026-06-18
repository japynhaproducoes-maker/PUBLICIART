/**
 * Endpoints — Sites (geração, edição, publicação)
 */

import { sitesApi, sectionsApi } from "@/lib/api";
import { apiClient } from "../client";
import { ApiError, toApiError } from "../errors";
import { generateSiteFromBriefing as mockGenerate } from "@/lib/generator";
import type {
  Site,
  GeneratedSection,
  GenerateSiteInput,
  UpsertSiteInput,
} from "../types";

export const sitesEndpoints = {
  async generateSiteFromBriefing(input: GenerateSiteInput): Promise<{
    site: Site;
    sections: GeneratedSection[];
  }> {
    try {
      if (apiClient.isRemote) {
        return apiClient.request(`/sites/generate`, { method: "POST", body: input });
      }
      // Mock: gera estrutura e persiste site + sections.
      const result = await mockGenerate(input.briefing);
      const site = await sitesApi.upsertForProject({
        project_id: input.project_id,
        title: result.title,
        slug: result.slug,
        theme_config: { ...result.theme, ...(input.theme ?? {}) },
        status: "ready",
      });
      await sectionsApi.replaceForSite(
        site.id,
        result.sections.map((s, i) => ({
          type: s.type,
          title: s.title,
          content: s.content,
          order_index: i,
          config: s.config ?? {},
        })),
      );
      const sections = await sectionsApi.listForSite(site.id);
      return { site, sections };
    } catch (e) { throw toApiError(e); }
  },

  async getSiteByProjectId(projectId: string): Promise<Site | null> {
    try {
      if (apiClient.isRemote)
        return apiClient.request<Site | null>(`/projects/${projectId}/site`);
      return await sitesApi.getForProject(projectId);
    } catch (e) { throw toApiError(e); }
  },

  async updateSite(input: UpsertSiteInput): Promise<Site> {
    try {
      if (apiClient.isRemote)
        return apiClient.request<Site>(`/sites`, { method: "PUT", body: input });
      return await sitesApi.upsertForProject(input);
    } catch (e) { throw toApiError(e); }
  },

  async updateSiteSection(
    siteId: string,
    sectionId: string,
    patch: Partial<Omit<GeneratedSection, "id" | "site_id">>,
  ): Promise<void> {
    try {
      if (apiClient.isRemote) {
        await apiClient.request<void>(`/sites/${siteId}/sections/${sectionId}`, {
          method: "PATCH",
          body: patch,
        });
        return;
      }
      const all = await sectionsApi.listForSite(siteId);
      const updated = all.map((s) => (s.id === sectionId ? { ...s, ...patch } : s));
      await sectionsApi.replaceForSite(
        siteId,
        updated.map(({ id: _id, site_id: _sid, ...rest }) => rest),
      );
    } catch (e) { throw toApiError(e); }
  },

  async publishSite(siteId: string, slug: string): Promise<void> {
    try {
      if (apiClient.isRemote) {
        await apiClient.request<void>(`/sites/${siteId}/publish`, { method: "POST", body: { slug } });
        return;
      }
      await sitesApi.publish(siteId, slug);
    } catch (e) { throw toApiError(e); }
  },

  async unpublishSite(siteId: string): Promise<void> {
    try {
      if (apiClient.isRemote) {
        await apiClient.request<void>(`/sites/${siteId}/unpublish`, { method: "POST" });
        return;
      }
      await sitesApi.unpublish(siteId);
    } catch (e) { throw toApiError(e); }
  },

  async getPublishedSiteBySlug(slug: string): Promise<Site> {
    try {
      const s = apiClient.isRemote
        ? await apiClient.request<Site | null>(`/public/sites/${slug}`)
        : await sitesApi.getBySlug(slug);
      if (!s || s.status !== "published")
        throw new ApiError("NOT_FOUND", "Site não publicado.", 404);
      return s;
    } catch (e) { throw toApiError(e); }
  },

  async listSections(siteId: string): Promise<GeneratedSection[]> {
    try {
      if (apiClient.isRemote)
        return apiClient.request<GeneratedSection[]>(`/sites/${siteId}/sections`);
      return await sectionsApi.listForSite(siteId);
    } catch (e) { throw toApiError(e); }
  },
};
