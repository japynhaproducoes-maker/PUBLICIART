/**
 * Snapshot mock das pricing rules quando rodando sem backend.
 * Espelha o que `GET /credits/pricing-rules` retornaria.
 */
import {
  ACTION_CATALOG,
  CREDIT_PACKS,
  CREDIT_VALUE_BRL,
  FREE_DAILY_ACTION_LIMIT,
  MIN_MARGIN_MULTIPLIER,
  PLAN_MULTIPLIER,
} from "./pricing";

export function pricingRulesMock() {
  return {
    creditValueBRL: CREDIT_VALUE_BRL,
    minMarginMultiplier: MIN_MARGIN_MULTIPLIER,
    freeDailyActionLimit: FREE_DAILY_ACTION_LIMIT,
    planMultipliers: PLAN_MULTIPLIER,
    actionCatalog: ACTION_CATALOG,
    packs: CREDIT_PACKS,
  };
}
