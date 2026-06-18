/**
 * Capacidades por plano — backend.
 * Espelha src/lib/plan-capabilities.ts (frontend) para evitar bypass via API.
 */
import type { PlanId } from "@prisma/client";

export interface PlanCapabilities {
  customDomain: boolean;
  removeBadge: boolean;
  maxSites: number;
  htmlExport: boolean;
  prioritySupport: boolean;
}

const TABLE: Record<PlanId, PlanCapabilities> = {
  start: { customDomain: false, removeBadge: false, maxSites: 1, htmlExport: false, prioritySupport: false },
  pro: { customDomain: true, removeBadge: true, maxSites: 3, htmlExport: false, prioritySupport: false },
  business: { customDomain: true, removeBadge: true, maxSites: 10, htmlExport: false, prioritySupport: true },
  full: { customDomain: true, removeBadge: true, maxSites: 999, htmlExport: true, prioritySupport: true },
};

export function planCapabilities(plan: PlanId): PlanCapabilities {
  return TABLE[plan] ?? TABLE.start;
}
