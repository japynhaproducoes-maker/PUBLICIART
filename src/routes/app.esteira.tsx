import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Factory, ChevronRight, Clock, Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ordersApi, projectsApi } from "@/lib/api";
import type { Order, Project } from "@/lib/types";
import { EmptyState } from "@/components/global";
import { KANBAN_COLUMNS, ORDER_STATUS_META, findService } from "@/lib/orders";

export const Route = createFileRoute("/app/esteira")({
  head: () => ({ meta: [{ title: "Esteira de produção — Publiciart Builder" }] }),
  component: EsteiraPage,
});

function EsteiraPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [o, p] = await Promise.all([
        ordersApi.listForUser(user.id),
        projectsApi.listForUser(user.id),
      ]);
      setOrders(o);
      setProjects(p);
    })();
  }, [user]);

  const projById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const grouped = useMemo(() => {
    return KANBAN_COLUMNS.map((col) => ({
      ...col,
      items: orders.filter((o) => col.statuses.includes(o.status)),
    }));
  }, [orders]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            <Factory className="h-5 w-5 text-brand" />
            Esteira de produção
          </h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe seus pedidos passando por cada etapa do nosso time.
          </p>
        </div>
        <Link
          to="/app/servicos"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-brand/25"
        >
          Pedir novo serviço
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="Sua esteira ainda está vazia"
          description="Quando você solicitar um serviço extra, ele aparece aqui passando por cada etapa."
          icon={Factory}
        />
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <div className="flex min-w-max gap-4 sm:grid sm:min-w-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {grouped.map((col) => (
              <div
                key={col.key}
                className="flex w-72 shrink-0 flex-col rounded-2xl border border-border bg-surface/40 p-3 sm:w-auto"
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {col.title}
                  </p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                    {col.items.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {col.items.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-[11px] text-muted-foreground">
                      Sem pedidos
                    </p>
                  ) : (
                    col.items.map((o) => (
                      <KanbanCard
                        key={o.id}
                        order={o}
                        project={o.project_id ? projById.get(o.project_id) : undefined}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KanbanCard({ order, project }: { order: Order; project?: Project }) {
  const svc = findService(order.service_type);
  const meta = ORDER_STATUS_META[order.status];
  const Icon = svc?.icon ?? Factory;
  return (
    <article className="rounded-xl border border-border bg-card p-3 transition hover:border-brand/40 hover:shadow-md hover:shadow-brand/5">
      <div className="flex items-start gap-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{order.service_label}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {project ? project.title : "Sem projeto vinculado"}
          </p>
        </div>
      </div>
      {order.notes && (
        <p className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">{order.notes}</p>
      )}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.tone}`}
        >
          <meta.icon className="h-3 w-3" />
          {meta.label}
        </span>
        <span className="text-[11px] font-semibold">
          {order.quoted_price ? `R$ ${order.quoted_price}` : `~R$ ${order.price}`}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(order.created_at).toLocaleDateString("pt-BR")}
        </span>
        {svc && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />~{svc.estimatedDays}d
          </span>
        )}
      </div>
    </article>
  );
}
