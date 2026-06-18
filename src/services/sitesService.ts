import { sitesApi, sectionsApi } from "@/lib/api";

export const sitesService = {
  getSiteForProject: sitesApi.getForProject.bind(sitesApi),
  getSiteBySlug: sitesApi.getBySlug.bind(sitesApi),
  listPublished: sitesApi.listPublished.bind(sitesApi),
  upsertSite: sitesApi.upsertForProject.bind(sitesApi),
  publishSite: sitesApi.publish.bind(sitesApi),
  unpublishSite: sitesApi.unpublish.bind(sitesApi),
  updateSlug: sitesApi.updateSlug.bind(sitesApi),
  listSections: sectionsApi.listForSite.bind(sectionsApi),
  replaceSections: sectionsApi.replaceForSite.bind(sectionsApi),
};
