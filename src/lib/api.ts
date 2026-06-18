/**
 * Camada de API.
 *
 * Hoje: opera sobre o mock store (localStorage).
 * Amanhã: trocar a implementação pela API REST própria mantendo
 * as mesmas assinaturas — a UI não precisa mudar.
 *
 * Convenção: todas as funções são async, simulando latência de rede.
 */

import { store, uid } from "./data/store";
import type {
  User,
  Plan,
  Project,
  Briefing,
  Site,
  Template,
  Order,
  OrderService,
  CreditTransaction,
  GeneratedSection,
  PlanId,
  ProjectStatus,
} from "./types";

const wait = (ms = 180) => new Promise((r) => setTimeout(r, ms));

/* ============================================================
 * AUTH (mock)
 * ============================================================ */

export const authApi = {
  async signUp(input: { name: string; email: string; password: string }): Promise<User> {
    await wait();
    const s = store.get();
    if (s.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("Esse e-mail já está cadastrado.");
    }
    const user: User = {
      id: uid("usr"),
      name: input.name,
      email: input.email,
      avatar_url: null,
      role: "user",
      plan_id: "start",
      credits_balance: 30,
      created_at: new Date().toISOString(),
    };
    store.update((next) => {
      next.users = [...next.users, user];
      next.session_user_id = user.id;
      next.credit_tx = [
        ...next.credit_tx,
        {
          id: uid("tx"),
          user_id: user.id,
          amount: 30,
          type: "monthly_grant",
          description: "Boas-vindas — créditos grátis",
          created_at: new Date().toISOString(),
        },
      ];
    });
    return user;
  },

  async signIn(input: { email: string; password: string }): Promise<User> {
    await wait();
    const s = store.get();
    let user = s.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
    // Modo demo: aceita qualquer e-mail/senha — cria usuário demo se não existir
    if (!user) {
      user = {
        id: uid("usr"),
        name: input.email.split("@")[0],
        email: input.email,
        avatar_url: null,
        role: input.email.toLowerCase().includes("admin") ? "admin" : "user",
        plan_id: "pro",

        credits_balance: 120,
        created_at: new Date().toISOString(),
      };
      store.update((n) => {
        n.users = [...n.users, user!];
      });
    }
    store.update((n) => {
      n.session_user_id = user!.id;
    });
    return user;
  },

  async signOut(): Promise<void> {
    await wait(80);
    store.update((n) => {
      n.session_user_id = null;
    });
  },

  async resetPassword(email: string): Promise<void> {
    await wait();
    // Mock: nunca revela se o e-mail existe. Em produção, o backend
    // envia o e-mail somente quando o usuário existe, mas a resposta
    // é sempre 204 — evita enumeração de contas.
    if (typeof window !== "undefined") {
      const fakeToken = btoa(`${email}:${Date.now()}`).replace(/=+$/, "");
      // eslint-disable-next-line no-console
      console.info(
        `[mock] Link de reset gerado para ${email}: ${window.location.origin}/resetar-senha?token=${fakeToken}`,
      );
    }
  },

  async confirmPasswordReset(_token: string, password: string): Promise<void> {
    await wait();
    if (!password || password.length < 8) {
      throw new Error("Senha precisa ter pelo menos 8 caracteres.");
    }
    // Mock: aceita qualquer token. Em produção, backend valida hash + expiração.
  },

  getCurrentUser(): User | null {
    const s = store.get();
    if (!s.session_user_id) return null;
    return s.users.find((u) => u.id === s.session_user_id) ?? null;
  },

  async updateProfile(patch: Partial<Pick<User, "name" | "avatar_url" | "email">>): Promise<User> {
    await wait();
    const current = this.getCurrentUser();
    if (!current) throw new Error("Sem sessão.");
    let updated: User = current;
    store.update((n) => {
      n.users = n.users.map((u) => {
        if (u.id === current.id) {
          updated = { ...u, ...patch };
          return updated;
        }
        return u;
      });
    });
    return updated;
  },
};

/* ============================================================
 * PLANS
 * ============================================================ */

export const plansApi = {
  async list(): Promise<Plan[]> {
    await wait(60);
    return store.get().plans;
  },
  async get(id: PlanId): Promise<Plan | null> {
    await wait(60);
    return store.get().plans.find((p) => p.id === id) ?? null;
  },
  async changePlan(userId: string, planId: PlanId): Promise<void> {
    await wait();
    store.update((n) => {
      n.users = n.users.map((u) => (u.id === userId ? { ...u, plan_id: planId } : u));
    });
  },
};

/* ============================================================
 * PROJECTS
 * ============================================================ */

export const projectsApi = {
  async listForUser(userId: string): Promise<Project[]> {
    await wait(100);
    return store.get().projects.filter((p) => p.user_id === userId);
  },
  async listAll(): Promise<Project[]> {
    await wait(100);
    return store.get().projects;
  },
  async get(id: string): Promise<Project | null> {
    await wait(60);
    return store.get().projects.find((p) => p.id === id) ?? null;
  },
  async create(input: Omit<Project, "id" | "created_at" | "updated_at" | "status"> & {
    status?: ProjectStatus;
  }): Promise<Project> {
    await wait();
    const now = new Date().toISOString();
    const project: Project = {
      id: uid("prj"),
      status: input.status ?? "draft",
      created_at: now,
      updated_at: now,
      ...input,
    };
    store.update((n) => {
      n.projects = [project, ...n.projects];
    });
    return project;
  },
  async update(id: string, patch: Partial<Project>): Promise<void> {
    await wait();
    store.update((n) => {
      n.projects = n.projects.map((p) =>
        p.id === id ? { ...p, ...patch, updated_at: new Date().toISOString() } : p,
      );
    });
  },
  async remove(id: string): Promise<void> {
    await wait();
    store.update((n) => {
      n.projects = n.projects.filter((p) => p.id !== id);
    });
  },
};

/* ============================================================
 * BRIEFINGS / SITES / TEMPLATES (mock)
 * ============================================================ */

export const briefingsApi = {
  async getForProject(projectId: string): Promise<Briefing | null> {
    await wait(60);
    return store.get().briefings.find((b) => b.project_id === projectId) ?? null;
  },
  async save(briefing: Briefing): Promise<void> {
    await wait();
    store.update((n) => {
      const exists = n.briefings.some((b) => b.id === briefing.id);
      n.briefings = exists
        ? n.briefings.map((b) => (b.id === briefing.id ? briefing : b))
        : [...n.briefings, briefing];
    });
  },
};

export const sitesApi = {
  async getForProject(projectId: string): Promise<Site | null> {
    await wait(60);
    return store.get().sites.find((s) => s.project_id === projectId) ?? null;
  },
  async getBySlug(slug: string): Promise<Site | null> {
    await wait(60);
    return store.get().sites.find((s) => s.slug === slug) ?? null;
  },
  async listPublished(): Promise<Site[]> {
    await wait(60);
    return store.get().sites.filter((s) => s.status === "published");
  },
  /**
   * Cria ou atualiza o site de um projeto (1 site por projeto).
   * Substituir por upsert no Supabase mantendo a mesma assinatura.
   */
  async upsertForProject(input: {
    project_id: string;
    title: string;
    slug: string;
    theme_config: Site["theme_config"];
    status?: Site["status"];
  }): Promise<Site> {
    await wait();
    const now = new Date().toISOString();
    let result: Site | null = null;
    store.update((n) => {
      const existing = n.sites.find((s) => s.project_id === input.project_id);
      if (existing) {
        result = {
          ...existing,
          title: input.title,
          slug: input.slug,
          theme_config: input.theme_config,
          status: input.status ?? existing.status,
          updated_at: now,
        };
        n.sites = n.sites.map((s) => (s.id === existing.id ? result! : s));
      } else {
        result = {
          id: uid("site"),
          project_id: input.project_id,
          title: input.title,
          slug: input.slug,
          status: input.status ?? "ready",
          published_url: null,
          html_content: null,
          theme_config: input.theme_config,
          created_at: now,
          updated_at: now,
        };
        n.sites = [...n.sites, result];
      }
    });
    return result!;
  },
  async publish(siteId: string, slug: string): Promise<void> {
    await wait();
    store.update((n) => {
      n.sites = n.sites.map((s) =>
        s.id === siteId
          ? {
              ...s,
              slug,
              status: "published",
              published_url: `/site/${slug}`,
              updated_at: new Date().toISOString(),
            }
          : s,
      );
    });
  },
  async unpublish(siteId: string): Promise<void> {
    await wait();
    store.update((n) => {
      n.sites = n.sites.map((s) =>
        s.id === siteId
          ? { ...s, status: "ready", published_url: null, updated_at: new Date().toISOString() }
          : s,
      );
    });
  },
  async updateSlug(siteId: string, slug: string): Promise<void> {
    await wait(80);
    store.update((n) => {
      n.sites = n.sites.map((s) => (s.id === siteId ? { ...s, slug } : s));
    });
  },
};

export const sectionsApi = {
  async listForSite(siteId: string): Promise<GeneratedSection[]> {
    await wait(60);
    return store
      .get()
      .sections.filter((s) => s.site_id === siteId)
      .sort((a, b) => a.order_index - b.order_index);
  },
  /**
   * Substitui todas as seções do site — equivale a um delete+insert atômico.
   * No Supabase, será uma transaction.
   */
  async replaceForSite(
    siteId: string,
    items: Omit<GeneratedSection, "id" | "site_id">[],
  ): Promise<void> {
    await wait();
    store.update((n) => {
      n.sections = [
        ...n.sections.filter((s) => s.site_id !== siteId),
        ...items.map((it) => ({ ...it, id: uid("sec"), site_id: siteId })),
      ];
    });
  },
};

export const templatesApi = {
  async list(): Promise<Template[]> {
    await wait(60);
    return store.get().templates;
  },
  async listBySegment(segment: string): Promise<Template[]> {
    await wait(60);
    return store.get().templates.filter(
      (t) => t.segment.toLowerCase() === segment.toLowerCase(),
    );
  },
};

/* ============================================================
 * ORDERS (serviços extras)
 * ============================================================ */

export const ordersApi = {
  async listForUser(userId: string): Promise<Order[]> {
    await wait(80);
    return store.get().orders.filter((o) => o.user_id === userId);
  },
  async listAll(): Promise<Order[]> {
    await wait(80);
    return store.get().orders;
  },
  async create(input: {
    user_id: string;
    project_id: string | null;
    service_type: OrderService;
    service_label: string;
    price: number;
    notes?: string;
  }): Promise<Order> {
    await wait();
    const now = new Date().toISOString();
    const order: Order = {
      id: uid("ord"),
      user_id: input.user_id,
      project_id: input.project_id,
      service_type: input.service_type,
      service_label: input.service_label,
      status: "requested",
      price: input.price,
      quoted_price: null,
      notes: input.notes ?? "",
      admin_notes: "",
      created_at: now,
      updated_at: now,
    };
    store.update((n) => {
      n.orders = [order, ...n.orders];
    });
    return order;
  },
  async update(id: string, patch: Partial<Omit<Order, "id" | "user_id" | "created_at">>): Promise<void> {
    await wait(100);
    store.update((n) => {
      n.orders = n.orders.map((o) =>
        o.id === id ? { ...o, ...patch, updated_at: new Date().toISOString() } : o,
      );
    });
  },
  async setStatus(id: string, status: Order["status"]): Promise<void> {
    return this.update(id, { status });
  },
};


/* ============================================================
 * CREDITS
 * ============================================================ */

import { estimateCredits, incrementDailyUsage, type CreditActionType, type EstimateInput, type EstimateBreakdown } from "./credits/pricing";
import type { CreditTxMetadata } from "./types";

export const creditsApi = {
  async listTxForUser(userId: string): Promise<CreditTransaction[]> {
    await wait(60);
    return store.get().credit_tx.filter((t) => t.user_id === userId);
  },

  /** Admin: lista todas as transações (sem filtro de usuário). */
  async listAllTx(): Promise<CreditTransaction[]> {
    await wait(60);
    return store.get().credit_tx;
  },

  /** Estima sem cobrar — UI usa pra mostrar antes de executar. */
  estimate(input: EstimateInput): EstimateBreakdown {
    return estimateCredits(input);
  },

  /**
   * Consome créditos referentes a uma ação de IA. Bloqueia se saldo insuficiente
   * e registra metadados completos para auditoria/admin.
   */
  async consumeForAction(params: {
    userId: string;
    action: CreditActionType;
    estimate: EstimateBreakdown;
    description?: string;
    projectId?: string | null;
    promptSize?: number;
  }): Promise<{ remaining: number; ok: boolean; reason?: string }> {
    await wait();
    const s = store.get();
    const user = s.users.find((u) => u.id === params.userId);
    if (!user) return { remaining: 0, ok: false, reason: "user_not_found" };
    if (user.credits_balance < params.estimate.finalCredits) {
      return { remaining: user.credits_balance, ok: false, reason: "insufficient_credits" };
    }

    const meta: CreditTxMetadata = {
      action_type: params.action,
      project_id: params.projectId ?? null,
      prompt_size: params.promptSize ?? 0,
      estimated_input_tokens: params.estimate.estimatedInputTokens,
      estimated_output_tokens: params.estimate.estimatedOutputTokens,
      estimated_cost_brl: Number(params.estimate.estimatedCostBRL.toFixed(4)),
      charged_credits: params.estimate.finalCredits,
      credit_value_brl: 0.1,
      estimated_revenue_brl: Number(params.estimate.estimatedRevenueBRL.toFixed(4)),
      estimated_margin_brl: Number(params.estimate.estimatedMarginBRL.toFixed(4)),
      plan_multiplier: params.estimate.planMultiplier,
      complexity_multiplier: params.estimate.complexityMultiplier,
    };

    let remaining = 0;
    store.update((n) => {
      n.users = n.users.map((u) => {
        if (u.id === params.userId) {
          remaining = u.credits_balance - params.estimate.finalCredits;
          return { ...u, credits_balance: remaining };
        }
        return u;
      });
      n.credit_tx = [
        {
          id: uid("tx"),
          user_id: params.userId,
          amount: -params.estimate.finalCredits,
          type: "consumption",
          description: params.description ?? params.estimate.actionLabel,
          created_at: new Date().toISOString(),
          metadata: meta,
        },
        ...n.credit_tx,
      ];
    });

    if (user.plan_id === "start") incrementDailyUsage();

    return { remaining, ok: true };
  },

  async consume(userId: string, amount: number, description: string): Promise<number> {
    await wait();
    let remaining = 0;
    store.update((n) => {
      n.users = n.users.map((u) => {
        if (u.id === userId) {
          remaining = Math.max(0, u.credits_balance - amount);
          return { ...u, credits_balance: remaining };
        }
        return u;
      });
      n.credit_tx = [
        {
          id: uid("tx"),
          user_id: userId,
          amount: -amount,
          type: "consumption",
          description,
          created_at: new Date().toISOString(),
        },
        ...n.credit_tx,
      ];
    });
    return remaining;
  },
  async add(userId: string, amount: number, description: string, type: CreditTransaction["type"] = "purchase"): Promise<number> {
    await wait();
    let total = 0;
    store.update((n) => {
      n.users = n.users.map((u) => {
        if (u.id === userId) {
          total = u.credits_balance + amount;
          return { ...u, credits_balance: total };
        }
        return u;
      });
      n.credit_tx = [
        {
          id: uid("tx"),
          user_id: userId,
          amount,
          type,
          description,
          created_at: new Date().toISOString(),
        },
        ...n.credit_tx,
      ];
    });
    return total;
  },

  /** Top-up via pacote — credita e registra como compra avulsa. */
  async topUp(userId: string, credits: number, priceBRL: number, packLabel: string): Promise<number> {
    return this.add(userId, credits, `Top-up ${packLabel} — R$ ${priceBRL}`, "topup");
  },
};

// ─── PRD API ──────────────────────────────────────────────────────────────────

import type { PRDResponse } from "@/lib/prd";

export const prdApi = {
  async analyze(projectId: string): Promise<PRDResponse> {
    const { apiBaseUrl } = await import("@/config/app").then((m) => m.appConfig);
    if (!apiBaseUrl) {
      // Mock: simula análise sem backend
      await new Promise((r) => setTimeout(r, 1500));
      const { generateMockPRD } = await import("@/lib/prdMock");
      return { prd: generateMockPRD(projectId), approved: false };
    }
    const res = await fetch(`${apiBaseUrl}/projects/${projectId}/prd/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!res.ok) throw new Error("Falha ao analisar briefing");
    return res.json();
  },

  async get(projectId: string): Promise<PRDResponse> {
    const { apiBaseUrl } = await import("@/config/app").then((m) => m.appConfig);
    if (!apiBaseUrl) {
      const { generateMockPRD } = await import("@/lib/prdMock");
      return { prd: generateMockPRD(projectId), approved: false };
    }
    const res = await fetch(`${apiBaseUrl}/projects/${projectId}/prd`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("PRD não encontrado");
    return res.json();
  },

  async approve(projectId: string): Promise<void> {
    const { apiBaseUrl } = await import("@/config/app").then((m) => m.appConfig);
    if (!apiBaseUrl) return;
    await fetch(`${apiBaseUrl}/projects/${projectId}/prd/approve`, {
      method: "POST",
      credentials: "include",
    });
  },
};
