/**
 * Barrel central de tipos do domínio.
 *
 * A fonte real está em `src/lib/types.ts` (mantida por compat).
 * Componentes novos devem importar a partir daqui:
 *
 *   import type { Project, Briefing } from "@/types";
 */

export type {
  User,
  Plan,
  PlanId,
  Project,
  ProjectStatus,
  Briefing,
  Site,
  GeneratedSection,
  SectionType,
  Template,
  Asset,
  Order,
  OrderService,
  OrderStatus,
  CreditTransaction,
  ThemeConfig,
} from "@/lib/types";
