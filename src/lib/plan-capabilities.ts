/**
 * Capacidades por plano — fonte única de verdade pra UI e gates.
 * Mantém alinhado com a comunicação comercial: SaaS recorrente,
 * publicação hospedada na Publiciart, domínio próprio em plano pago.
 */
import type { PlanId } from "./types";

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

export type PublishedSiteStatus =
  | "draft"
  | "published"
  | "suspended"   // assinatura inativa
  | "unpublished";

export interface PlanCapabilities {
  customDomain: boolean;
  removeBadge: boolean;
  premiumTemplates: boolean;
  multipleSites: boolean;
  clientsManagement: boolean;
  prioritySupport: boolean;
  humanSupport: boolean;
  maxPublishedSites: number; // -1 = ilimitado
}

const TABLE: Record<PlanId, PlanCapabilities> = {
  start: {
    customDomain: false,
    removeBadge: false,
    premiumTemplates: false,
    multipleSites: false,
    clientsManagement: false,
    prioritySupport: false,
    humanSupport: false,
    maxPublishedSites: 1,
  },
  pro: {
    customDomain: true,
    removeBadge: true,
    premiumTemplates: true,
    multipleSites: false,
    clientsManagement: false,
    prioritySupport: false,
    humanSupport: false,
    maxPublishedSites: 1,
  },
  business: {
    customDomain: true,
    removeBadge: true,
    premiumTemplates: true,
    multipleSites: true,
    clientsManagement: true,
    prioritySupport: true,
    humanSupport: false,
    maxPublishedSites: -1,
  },
  full: {
    customDomain: true,
    removeBadge: true,
    premiumTemplates: true,
    multipleSites: true,
    clientsManagement: true,
    prioritySupport: true,
    humanSupport: true,
    maxPublishedSites: -1,
  },
};

export function planCapabilities(plan: PlanId | undefined): PlanCapabilities {
  return TABLE[plan ?? "start"];
}

const ORDER: PlanId[] = ["start", "pro", "business", "full"];

export function nextPlan(plan: PlanId | undefined): PlanId | null {
  const i = ORDER.indexOf(plan ?? "start");
  if (i < 0 || i >= ORDER.length - 1) return null;
  return ORDER[i + 1];
}

export function isPaidPlan(plan: PlanId | undefined): boolean {
  return plan !== undefined && plan !== "start";
}

/** Subscription status helpers — UI usa pra mostrar avisos de assinatura. */
export function subscriptionIsActive(status: SubscriptionStatus | undefined): boolean {
  return status === "active" || status === "trialing";
}

export function siteIsLive(
  siteStatus: PublishedSiteStatus,
  subscription: SubscriptionStatus | undefined,
): boolean {
  return siteStatus === "published" && subscriptionIsActive(subscription);
}
