/**
 * Tipagens compartilhadas da camada de API.
 *
 * Re-export dos tipos de domínio + envelopes de request/response que o
 * backend real deverá honrar. Esta é a fonte da verdade para a UI.
 */

export type {
  User,
  UserRole,
  Plan,
  PlanId,
  Project,
  ProjectStatus,
  Briefing,
  Site,
  SiteStatus,
  GeneratedSection,
  SectionType,
  Template,
  Asset,
  AssetType,
  Order,
  OrderService,
  OrderStatus,
  CreditTransaction,
  CreditTxType,
  ThemeConfig,
} from "@/lib/types";

import type { Project, ProjectStatus, Briefing, ThemeConfig, OrderService, AssetType } from "@/lib/types";

/* ---------- AUTH ---------- */
export interface LoginInput {
  email: string;
  password: string;
}
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

/* ---------- PROJECTS ---------- */
export interface CreateProjectInput {
  user_id: string;
  title: string;
  business_name: string;
  segment: string;
  objective: string;
  template_id?: string | null;
  status?: ProjectStatus;
}
export type UpdateProjectInput = Partial<Project>;

/* ---------- BRIEFINGS ---------- */
export type SaveBriefingInput = Briefing;

/* ---------- SITES ---------- */
export interface GenerateSiteInput {
  project_id: string;
  briefing: Briefing;
  theme?: Partial<ThemeConfig>;
}
export interface UpsertSiteInput {
  project_id: string;
  title: string;
  slug: string;
  theme_config: ThemeConfig;
}

/* ---------- ORDERS ---------- */
export interface CreateOrderInput {
  user_id: string;
  project_id: string | null;
  service_type: OrderService;
  service_label: string;
  price: number;
  notes?: string;
}

/* ---------- ASSETS ---------- */
export interface UploadAssetInput {
  user_id: string;
  project_id?: string | null;
  type: AssetType;
  name: string;
  /** Em mock, basta um data URL ou URL externa. Backend real receberá File/Blob. */
  url: string;
}

/* ---------- Envelope HTTP futuro ---------- */
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  page_size: number;
  total: number;
}
