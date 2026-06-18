import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Clock, X, ChevronRight, ShoppingBag, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ordersApi, projectsApi } from "@/lib/api";
import type { Order, Project } from "@/lib/types";
import { EmptyState } from "@/components/global";
import { SERVICE_CATALOG, ORDER_STATUS_META, type ServiceDef } from "@/lib/orders";

export const Route = createFileRoute("/app/servicos")({
  head: () => ({ meta: [{ title: "Pedidos extras — Publiciart Builder" }] }),
  component: ServicesPage,
});

function ServicesPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [openService, setOpenService] = useState<ServiceDef | null>(null);

  async function refresh() {
    if (!user) return;
    const [o, p] = await Promise.all([
      ordersApi.listForUser(user.id),
      projectsApi.listForUser(user.id),
    ]);
    setOrders(o);
    setProjects(p);
  }

  useEffect(() => {
    void refresh();
     
  }, [user]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Pedidos extras</h2>
          <p className="text-sm text-muted-foreground">
            Quando seu site precisa de um empurrão criativo, nosso time entra em campo.
          </p>
        </div>
        <Link
          to="/app/esteira"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold hover:border-brand/40"
        >
          <ShoppingBag className="h-3.5 w-3.5 text-brand" />
          Ver esteira de produção
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICE_CATALOG.map((s) => (
          <ServiceCard key={s.id + s.name} svc={s} onRequest={() => setOpenService(s)} />
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Seus pedidos</h3>
          <Link to="/app/esteira" className="text-xs font-semibold text-brand hover:underline">
            Acompanhar na esteira →
          </Link>
        </div>
        {orders.length === 0 ? (
          <EmptyState
            title="Você ainda não pediu nenhum extra"
            description="Quando solicitar um serviço acima, ele aparece aqui pra você acompanhar."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <ul className="divide-y divide-border">
              {orders.map((o) => {
                const meta = ORDER_STATUS_META[o.status];
                return (
                  <li key={o.id} className="flex items-center gap-4 p-4 sm:p-5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{o.service_label}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {o.notes || "Sem observações"} ·{" "}
                        {new Date(o.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <p className="hidden font-semibold sm:block">
                      {o.quoted_price ? `R$ ${o.quoted_price}` : `~R$ ${o.price}`}
                    </p>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.tone}`}
                    >
                      <meta.icon className="h-3 w-3" />
                      {meta.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      {openService && (
        <RequestModal
          svc={openService}
          projects={projects}
          userId={user.id}
          onClose={() => setOpenService(null)}
          onDone={async () => {
            setOpenService(null);
            await refresh();
          }}
        />
      )}
    </div>
  );
}

function ServiceCard({ svc, onRequest }: { svc: ServiceDef; onRequest: () => void }) {
  return (
    <div className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5">
      <div className="flex items-start justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand transition group-hover:bg-brand-gradient group-hover:text-white">
          <svc.icon className="h-5 w-5" />
        </div>
        {svc.badge && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              svc.badge === "premium"
                ? "bg-amber-400/20 text-amber-500"
                : "bg-brand/15 text-brand"
            }`}
          >
            {svc.badge === "premium" ? "Premium" : "Mais pedido"}
          </span>
        )}
      </div>
      <h3 className="mt-4 font-display font-semibold">{svc.name}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{svc.desc}</p>

      <p className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground">Pra quem é</p>
      <p className="text-xs">{svc.audience}</p>

      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
        {svc.includes.slice(0, 3).map((it) => (
          <li key={it} className="flex gap-1.5">
            <span className="text-brand">✓</span>
            {it}
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            <Clock className="mr-1 inline h-3 w-3" />
            Prazo
          </span>
          <span className="font-semibold text-foreground">{svc.estimatedDays} dias úteis</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-brand-gradient"
            style={{ width: `${Math.min(100, svc.estimatedDays * 8)}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="font-display text-lg font-bold text-brand">{svc.priceLabel}</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Disponível
        </span>
      </div>
      <button
        onClick={onRequest}
        className="mt-4 w-full rounded-lg bg-brand-gradient px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition hover:opacity-95"
      >
        Solicitar
      </button>
    </div>
  );
}

function RequestModal({
  svc,
  projects,
  userId,
  onClose,
  onDone,
}: {
  svc: ServiceDef;
  projects: Project[];
  userId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [projectId, setProjectId] = useState<string>(projects[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const includes = useMemo(() => svc.includes, [svc]);

  async function submit() {
    setSubmitting(true);
    try {
      await ordersApi.create({
        user_id: userId,
        project_id: projectId || null,
        service_type: svc.id,
        service_label: svc.name,
        price: svc.price,
        notes,
      });
      onDone();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
              <svc.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold">{svc.name}</h3>
              <p className="text-xs text-muted-foreground">
                A partir de {svc.priceLabel} · prazo {svc.estimatedDays} dias úteis
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              O que inclui
            </p>
            <ul className="mt-1.5 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
              {includes.map((it) => (
                <li key={it} className="flex gap-1.5">
                  <span className="text-brand">✓</span>
                  {it}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Projeto relacionado (opcional)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand"
            >
              <option value="">— Sem projeto relacionado —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.segment})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Observações para o nosso time
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Conte o que precisa, referências, prazos, estilo…"
              className="mt-1.5 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface/60 p-4">
          <button
            onClick={onClose}
            className="rounded-md px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-gradient px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand/25 disabled:opacity-60"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {submitting ? "Enviando..." : "Enviar solicitação"}
          </button>
        </div>
      </div>
    </div>
  );
}
