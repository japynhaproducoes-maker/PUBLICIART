import { templatesApi } from "@/lib/api";

export const templatesService = {
  listTemplates: templatesApi.list.bind(templatesApi),
  listBySegment: templatesApi.listBySegment.bind(templatesApi),
};
