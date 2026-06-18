/**
 * Mock store baseado em localStorage.
 *
 * SUBSTITUIÇÃO FUTURA: trocar este arquivo por chamadas Supabase mantendo
 * a mesma assinatura em src/lib/api.ts. A UI não muda.
 */

import {
  SEED_PLANS,
  SEED_PROJECTS,
  SEED_TEMPLATES,
  SEED_BRIEFINGS,
  SEED_SITES,
  SEED_SECTIONS,
  SEED_ORDERS,
  SEED_CREDIT_TX,
  SEED_USERS,
} from "./seed";
import type {
  Plan,
  Project,
  Template,
  Briefing,
  Site,
  GeneratedSection,
  Order,
  CreditTransaction,
  User,
  Asset,
} from "@/lib/types";

const KEY = "publiciart.store.v4";

interface StoreShape {
  users: User[];
  session_user_id: string | null;
  plans: Plan[];
  projects: Project[];
  templates: Template[];
  briefings: Briefing[];
  sites: Site[];
  sections: GeneratedSection[];
  orders: Order[];
  credit_tx: CreditTransaction[];
  assets: Asset[];
}

const DEFAULT_STATE: StoreShape = {
  users: SEED_USERS,
  session_user_id: null,
  plans: SEED_PLANS,
  projects: SEED_PROJECTS,
  templates: SEED_TEMPLATES,
  briefings: SEED_BRIEFINGS,
  sites: SEED_SITES,
  sections: SEED_SECTIONS,
  orders: SEED_ORDERS,
  credit_tx: SEED_CREDIT_TX,
  assets: [],
};

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function load(): StoreShape {
  if (!isBrowser()) return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function save(state: StoreShape) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    notify();
  } catch {
    /* quota — silencioso */
  }
}

/* ============================================================
 * Pub/sub mínimo para re-render reativo na UI
 * ============================================================ */
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export const store = {
  get(): StoreShape {
    return load();
  },
  update(mut: (s: StoreShape) => StoreShape | void) {
    const current = load();
    const next = mut({ ...current });
    save(next ?? current);
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  reset() {
    if (isBrowser()) localStorage.removeItem(KEY);
    notify();
  },
};

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}
