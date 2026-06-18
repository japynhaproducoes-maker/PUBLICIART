import { plansApi } from "@/lib/api";

export const plansService = {
  listPlans: plansApi.list.bind(plansApi),
  getPlan: plansApi.get.bind(plansApi),
  changePlan: plansApi.changePlan.bind(plansApi),
};
