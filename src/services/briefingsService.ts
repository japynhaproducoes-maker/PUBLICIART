import { briefingsApi } from "@/lib/api";

export const briefingsService = {
  getBriefing: briefingsApi.getForProject.bind(briefingsApi),
  saveBriefing: briefingsApi.save.bind(briefingsApi),
};
