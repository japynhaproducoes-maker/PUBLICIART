/**
 * Barrel principal da camada de API.
 *
 * Uso na UI / hooks / serviços:
 *
 *   import { api } from "@/lib/api/index";
 *   const projects = await api.projects.listProjects(userId);
 *
 * Ou importando diretamente cada namespace:
 *
 *   import { projectsEndpoints } from "@/lib/api/endpoints/projects";
 */

import { authEndpoints } from "./endpoints/auth";
import { projectsEndpoints } from "./endpoints/projects";
import { briefingsEndpoints } from "./endpoints/briefings";
import { sitesEndpoints } from "./endpoints/sites";
import { templatesEndpoints } from "./endpoints/templates";
import { creditsEndpoints } from "./endpoints/credits";
import { ordersEndpoints } from "./endpoints/orders";
import { plansEndpoints } from "./endpoints/plans";
import { assetsEndpoints } from "./endpoints/assets";

export const api = {
  auth: authEndpoints,
  projects: projectsEndpoints,
  briefings: briefingsEndpoints,
  sites: sitesEndpoints,
  templates: templatesEndpoints,
  credits: creditsEndpoints,
  orders: ordersEndpoints,
  plans: plansEndpoints,
  assets: assetsEndpoints,
} as const;

export { apiClient } from "./client";
export { ApiError, friendlyMessage, toApiError } from "./errors";
export type { ApiErrorCode } from "./errors";
export type * from "./types";
