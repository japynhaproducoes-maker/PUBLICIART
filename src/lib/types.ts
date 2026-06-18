/**
 * Domain types — Publiciart Builder
 *
 * Espelham as tabelas do backend próprio (PostgreSQL via Prisma).
 * Mantenha estes tipos como contrato — o backend real deve produzir
 * exatamente estas formas para que a camada de UI não precise mudar.
 */

export type UserRole = "user" | "agency" | "admin";

export type PlanId = "start" | "pro" | "business" | "full";

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  plan_id: PlanId;
  credits_balance: number;
  /** Status da assinatura recorrente. Default: "active" pra contas demo. */
  subscription_status?: SubscriptionStatus;
  created_at: string;
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // BRL
  description: string;
  credits_per_month: number;
  max_projects: number; // -1 = ilimitado
  features: string[];
  is_popular: boolean;
}

export type ProjectStatus =
  | "draft"
  | "briefing_pending"
  | "generating"
  | "editing"
  | "review"
  | "published"
  | "archived";

export interface Project {
  id: string;
  user_id: string;
  title: string;
  business_name: string;
  segment: string;
  objective: string;
  status: ProjectStatus;
  template_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Briefing {
  id: string;
  project_id: string;
  business_name: string;
  segment: string;
  city: string;
  target_audience: string;
  main_offer: string;
  services: string[];
  whatsapp: string;
  instagram: string;
  visual_style: string;
  goal: string;
  notes: string;
}

export type SiteStatus = "draft" | "ready" | "published";

export interface Site {
  id: string;
  project_id: string;
  title: string;
  slug: string;
  status: SiteStatus;
  published_url: string | null;
  html_content: string | null;
  theme_config: ThemeConfig;
  created_at: string;
  updated_at: string;
}

export interface ThemeConfig {
  primary: string;
  accent: string;
  font: string;
  mode: "light" | "dark";
}

export type SectionType =
  | "hero"
  | "about"
  | "services"
  | "gallery"
  | "pricing"
  | "testimonials"
  | "contact"
  | "cta"
  | "faq";

export interface GeneratedSection {
  id: string;
  site_id: string;
  type: SectionType;
  title: string;
  content: string;
  order_index: number;
  config: Record<string, unknown>;
}

export interface Template {
  id: string;
  name: string;
  segment: string;
  description: string;
  preview_image: string; // url ou gradient
  style_tags: string[];
  sections: SectionType[];
  is_premium: boolean;
}

export type AssetType = "image" | "video" | "logo" | "document";

export interface Asset {
  id: string;
  user_id: string;
  project_id: string | null;
  type: AssetType;
  url: string;
  name: string;
  created_at: string;
}

export type OrderService =
  | "logo"
  | "identidade_visual"
  | "artes_instagram"
  | "video"
  | "jingle"
  | "pagina_vendas"
  | "trafego"
  | "manutencao"
  | "ensaio_fotos"
  | "pacote_completo";

export type OrderStatus =
  | "requested"
  | "analyzing"
  | "quoted"
  | "approved"
  | "in_production"
  | "in_review"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  user_id: string;
  project_id: string | null;
  service_type: OrderService;
  service_label: string;
  status: OrderStatus;
  price: number;          // valor estimado inicial
  quoted_price: number | null; // orçamento enviado
  notes: string;          // observações do cliente
  admin_notes: string;    // observações internas / equipe
  created_at: string;
  updated_at: string;
}

export type CreditTxType = "monthly_grant" | "purchase" | "consumption" | "refund" | "bonus" | "daily_grant" | "topup";

export interface CreditTxMetadata {
  action_type?: string;
  project_id?: string | null;
  prompt_size?: number;
  estimated_input_tokens?: number;
  estimated_output_tokens?: number;
  estimated_cost_brl?: number;
  charged_credits?: number;
  credit_value_brl?: number;
  estimated_revenue_brl?: number;
  estimated_margin_brl?: number;
  plan_multiplier?: number;
  complexity_multiplier?: number;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number; // positivo = entrada, negativo = consumo
  type: CreditTxType;
  description: string;
  created_at: string;
  metadata?: CreditTxMetadata;
}


/* ============================================================
 * Permissões — fonte única de verdade para checagens na UI
 * (no backend, replicar via RLS/policies)
 * ============================================================ */

export const PERMISSIONS = {
  "projects.create": ["user", "agency", "admin"] satisfies UserRole[],
  "projects.viewAll": ["admin"] satisfies UserRole[],
  "projects.manageOthers": ["agency", "admin"] satisfies UserRole[],
  "users.manage": ["admin"] satisfies UserRole[],
  "orders.viewAll": ["admin"] satisfies UserRole[],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly UserRole[]).includes(role);
}
