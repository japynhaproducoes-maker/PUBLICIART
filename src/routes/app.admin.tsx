import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Shield, Search, Coins, AlertTriangle, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ordersApi, projectsApi, creditsApi } from "@/lib/api";
import type { Order, Project, OrderStatus, CreditTransaction } from "@/lib/types";
import { store } from "@/lib/data/store";
import { ORDER_STATUS_META, findService } from "@/lib/orders";
import { EmptyState } from "@/components/global";
import { MIN_MARGIN_MULTIPLIER, formatBRL } from "@/lib/credits/pricing";

export const Route = createFileRoute("/app/admin")({
  head: () => ({ meta: [{ title: "Admin — Esteira interna Publiciart" }] }),
  component: AdminPage,
});

const STATUSES: OrderStatus[] = [
  "requested",
  "analyzing",
  "quoted",
  "approved",
  "in_production",
  "in_review",
  "delivered",
  "cancelled",
];

function AdminPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [creditsTx, setCreditsTx] = useState<CreditTransaction[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [editing, setEditing] = useState<Order | null>(null);

  async function refresh() {
    const [o, p, tx] = await Promise.all([ordersApi.listAll(), projectsApi.listAll(), creditsApi.listAllTx()]);
    setOrders(o);
    setProjects(p);
    setCreditsTx(tx);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const projById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  const users = useMemo(() => store.get().users, [orders]);
  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const isAdmin = user?.role === "admin";

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!term) return true;
      const u = userById.get(o.user_id);
      return [o.service_label, o.notes, o.admin_notes, u?.name, u?.email]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(term));
    });
  }, [orders, statusFilter, search, userById]);

  const totals = useMemo(() => {
    return {
      total: orders.length,
      production: orders.filter((o) => o.status === "in_production").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      mrr: orders
        .filter((o) => o.quoted_price)
        .reduce((sum, o) => sum + (o.quoted_price ?? 0), 0),
    };
  }, [orders]);

  if (!user) return null;
  if (!isAdmin) {
    return (
      <EmptyState
        title="Área restrita ao time Publiciart"
        description="Você precisa de permissão de administrador para acessar a esteira interna."
        icon={Shield}
        action={
          <Link to="/app" className="text-xs font-semibold text-brand hover:underline">
            Voltar à visão geral
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
          <Shield className="h-5 w-5 text-brand" />
          Esteira interna — Admin
        </h2>
        <p className="text-sm text-muted-foreground">
          Todos os pedidos da plataforma com status, valor estimado e observações.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Pedidos" value={totals.total} />
        <Stat label="Em produção" value={totals.production} />
        <Stat label="Entregues" value={totals.delivered} />
        <Stat label="Faturamento estimado" value={`R$ ${totals.mrr}`} />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, serviço, observação…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none"
        >
          <option value="all">Todos os status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_META[s].label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Serviço</th>
                <th className="px-4 py-3">Projeto</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">
                    Nenhum pedido encontrado com esses filtros.
                  </td>
                </tr>
              )}
              {filtered.map((o) => {
                const meta = ORDER_STATUS_META[o.status];
                const svc = findService(o.service_type);
                const u = userById.get(o.user_id);
                const p = o.project_id ? projById.get(o.project_id) : undefined;
                const Icon = svc?.icon ?? Shield;
                return (
                  <tr key={o.id} className="align-top hover:bg-surface/40">
                    <td className="px-4 py-3">
                      <p className="font-medium">{u?.name ?? "Cliente"}</p>
                      <p className="text-[11px] text-muted-foreground">{u?.email ?? o.user_id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-soft text-brand">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div>
                          <p className="font-medium">{o.service_label}</p>
                          {o.notes && (
                            <p className="line-clamp-1 text-[11px] text-muted-foreground">
                              "{o.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {p ? p.title : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.tone}`}
                      >
                        <meta.icon className="h-3 w-3" />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-semibold">
                        {o.quoted_price ? `R$ ${o.quoted_price}` : `~R$ ${o.price}`}
                      </p>
                      {!o.quoted_price && (
                        <p className="text-[10px] text-muted-foreground">a orçar</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditing(o)}
                        className="rounded-md bg-brand/10 px-2.5 py-1.5 text-[11px] font-semibold text-brand hover:bg-brand/20"
                      >
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CreditsAdminSection
        transactions={creditsTx}
        userById={userById}
        projects={projects}
      />

      {editing && (
        <AdminEditModal
          order={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await refresh();
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
 * Credits admin — consumo de IA, ranking e margem
 * ============================================================ */
function CreditsAdminSection({
  transactions,
  userById,
  projects,
}: {
  transactions: CreditTransaction[];
  userById: Map<string, { id: string; name: string; email: string; plan_id: string }>;
  projects: Project[];
}) {
  const [userFilter, setUserFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  // Apenas consumo de IA (tem metadata com action_type)
  const consumption = useMemo(
    () => transactions.filter((t) => t.type === "consumption" && t.metadata?.action_type),
    [transactions],
  );

  const filtered = useMemo(() => {
    return consumption.filter((t) => {
      if (userFilter !== "all" && t.user_id !== userFilter) return false;
      if (projectFilter !== "all" && (t.metadata?.project_id ?? null) !== projectFilter) return false;
      return true;
    });
  }, [consumption, userFilter, projectFilter]);

  const totals = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    let credits = 0;
    let lowMargin = 0;
    for (const t of filtered) {
      revenue += t.metadata?.estimated_revenue_brl ?? 0;
      cost += t.metadata?.estimated_cost_brl ?? 0;
      credits += Math.abs(t.amount);
      const ratio = (t.metadata?.estimated_revenue_brl ?? 0) / Math.max(0.0001, t.metadata?.estimated_cost_brl ?? 0);
      if (ratio < MIN_MARGIN_MULTIPLIER) lowMargin++;
    }
    return { revenue, cost, credits, lowMargin, margin: revenue - cost };
  }, [filtered]);

  // Ranking por usuário
  const ranking = useMemo(() => {
    const acc = new Map<string, { credits: number; revenue: number; cost: number; actions: number }>();
    for (const t of filtered) {
      const cur = acc.get(t.user_id) ?? { credits: 0, revenue: 0, cost: 0, actions: 0 };
      cur.credits += Math.abs(t.amount);
      cur.revenue += t.metadata?.estimated_revenue_brl ?? 0;
      cur.cost += t.metadata?.estimated_cost_brl ?? 0;
      cur.actions += 1;
      acc.set(t.user_id, cur);
    }
    return Array.from(acc.entries())
      .map(([uid, v]) => ({ uid, ...v }))
      .sort((a, b) => b.credits - a.credits)
      .slice(0, 10);
  }, [filtered]);

  const usersWithActivity = useMemo(() => {
    const ids = new Set(consumption.map((t) => t.user_id));
    return Array.from(ids).map((id) => userById.get(id)).filter(Boolean) as { id: string; name: string; email: string }[];
  }, [consumption, userById]);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
          <Coins className="h-5 w-5 text-brand" />
          Consumo de créditos (IA)
        </h2>
        <p className="text-sm text-muted-foreground">
          Auditoria de cada ação de IA, com custo estimado, margem e alertas quando a margem fica abaixo de {MIN_MARGIN_MULTIPLIER}x.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Ações cobradas" value={filtered.length} />
        <Stat label="Créditos consumidos" value={totals.credits} />
        <Stat label="Receita estimada" value={formatBRL(totals.revenue)} />
        <Stat label="Margem estimada" value={formatBRL(totals.margin)} />
      </div>

      {totals.lowMargin > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <p className="font-semibold">{totals.lowMargin} ações com margem abaixo de {MIN_MARGIN_MULTIPLIER}x.</p>
            <p>Revise pricing, complexidade ou multiplicadores do plano para proteger a margem mínima.</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Usuário</label>
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none"
        >
          <option value="all">Todos</option>
          {usersWithActivity.map((u) => (
            <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
          ))}
        </select>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Projeto</label>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none"
        >
          <option value="all">Todos</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        {(userFilter !== "all" || projectFilter !== "all") && (
          <button
            onClick={() => { setUserFilter("all"); setProjectFilter("all"); }}
            className="ml-auto text-[11px] font-semibold text-brand hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Últimas ações</p>
          </div>
          <div className="max-h-[480px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-surface/60 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Data</th>
                  <th className="px-3 py-2">Usuário</th>
                  <th className="px-3 py-2">Ação</th>
                  <th className="px-3 py-2 text-right">Tokens</th>
                  <th className="px-3 py-2 text-right">Mult.</th>
                  <th className="px-3 py-2 text-right">Custo</th>
                  <th className="px-3 py-2 text-right">Cobrado</th>
                  <th className="px-3 py-2 text-right">Margem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">Nenhuma ação encontrada.</td></tr>
                )}
                {filtered.slice(0, 200).map((t) => {
                  const m = t.metadata!;
                  const ratio = (m.estimated_revenue_brl ?? 0) / Math.max(0.0001, m.estimated_cost_brl ?? 0);
                  const low = ratio < MIN_MARGIN_MULTIPLIER;
                  const u = userById.get(t.user_id);
                  return (
                    <tr key={t.id} className="align-top hover:bg-surface/40">
                      <td className="px-3 py-2 text-muted-foreground">
                        {new Date(t.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-medium">{u?.name ?? "—"}</p>
                        <p className="text-[10px] text-muted-foreground">{u?.email}</p>
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-medium">{m.action_type}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{t.description}</p>
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {(m.estimated_input_tokens ?? 0)}/{(m.estimated_output_tokens ?? 0)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span title="plano × complexidade">
                          x{m.plan_multiplier}·x{m.complexity_multiplier?.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">{formatBRL(m.estimated_cost_brl ?? 0)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{Math.abs(t.amount)}c</td>
                      <td className={`px-3 py-2 text-right font-semibold ${low ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {low && <AlertTriangle className="mr-1 inline h-3 w-3" />}
                        x{ratio.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <TrendingUp className="h-4 w-4 text-brand" />
            <p className="text-sm font-semibold">Top 10 usuários por consumo</p>
          </div>
          <ul className="divide-y divide-border">
            {ranking.length === 0 && (
              <li className="px-4 py-6 text-center text-xs text-muted-foreground">Sem dados ainda.</li>
            )}
            {ranking.map((r, i) => {
              const u = userById.get(r.uid);
              const margin = r.revenue - r.cost;
              return (
                <li key={r.uid} className="flex items-center gap-3 px-4 py-3 text-xs">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-soft text-[10px] font-bold text-brand">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{u?.name ?? r.uid}</p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {u?.email} · plano {u?.plan_id ?? "?"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand">{r.credits}c</p>
                    <p className="text-[10px] text-muted-foreground">
                      {r.actions} ações · margem {formatBRL(margin)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}

function AdminEditModal({
  order,
  onClose,
  onSaved,
}: {
  order: Order;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [quoted, setQuoted] = useState<string>(order.quoted_price?.toString() ?? "");
  const [adminNotes, setAdminNotes] = useState(order.admin_notes);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await ordersApi.update(order.id, {
        status,
        quoted_price: quoted ? Number(quoted) : null,
        admin_notes: adminNotes,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="border-b border-border p-5">
          <h3 className="font-display text-lg font-semibold">{order.service_label}</h3>
          <p className="text-xs text-muted-foreground">{order.notes || "Sem observações do cliente"}</p>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Valor orçado (R$)
              </label>
              <input
                type="number"
                value={quoted}
                onChange={(e) => setQuoted(e.target.value)}
                placeholder={`Estimado: ${order.price}`}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Observações internas
            </label>
            <textarea
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="mt-1.5 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Designer responsável, próximos passos, fornecedor…"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface/60 p-4">
          <button
            onClick={onClose}
            className="rounded-md px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
          >
            Fechar
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-md bg-brand-gradient px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand/25 disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
