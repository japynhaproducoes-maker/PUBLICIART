import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClipboardList, ArrowRight, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { projectsApi, briefingsApi } from "@/lib/api";
import type { Project, Briefing } from "@/lib/types";
import { EmptyState } from "@/components/global";
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_DOT } from "@/lib/status";

export const Route = createFileRoute("/app/briefings")({
  head: () => ({ meta: [{ title: "Briefings — Publiciart Builder" }] }),
  component: BriefingsPage,
});

type Row = { project: Project; briefing: Briefing | null };

function BriefingsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const projects = await projectsApi.listForUser(user.id);
      const out: Row[] = [];
      for (const p of projects) {
        const b = await briefingsApi.getForProject(p.id);
        out.push({ project: p, briefing: b });
      }
      setRows(out);
    })();
  }, [user]);

  if (!user || !rows) {
    return <p className="text-sm text-muted-foreground">Carregando seus briefings...</p>;
  }

  const pending = rows.filter((r) => !r.briefing).length;
  const filled = rows.filter((r) => r.briefing).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Briefings</h2>
        <p className="text-sm text-muted-foreground">
          A base de tudo. Quanto mais detalhe, melhor o site sai.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Briefings preenchidos" value={String(filled)} tone="success" />
        <Stat label="Aguardando você" value={String(pending)} tone="warning" />
        <Stat label="Total de projetos" value={String(rows.length)} tone="brand" />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum briefing por aqui"
          description="Crie um projeto e responda algumas perguntas. A IA monta o resto."
          action={
            <Link
              to="/app/criador"
              className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
            >
              Começar novo projeto
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.project.id} className="flex items-center gap-4 p-4 sm:p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-semibold">{r.project.title}</p>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{r.project.segment}</span>
                    <span className="text-border">•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${PROJECT_STATUS_DOT[r.project.status]}`} />
                      {PROJECT_STATUS_LABEL[r.project.status]}
                    </span>
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  {r.briefing ? (
                    <p className="text-[11px] text-muted-foreground">
                      Cidade: <strong className="text-foreground">{r.briefing.city}</strong>
                    </p>
                  ) : (
                    <p className="text-[11px] font-semibold text-warning">Briefing pendente</p>
                  )}
                </div>
                <Link
                  to="/app/criador"
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    r.briefing
                      ? "border border-border bg-background hover:border-brand/40"
                      : "bg-brand-gradient text-white"
                  }`}
                >
                  {r.briefing ? "Revisar" : "Responder"} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const TONE: Record<string, string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  brand: "bg-brand-soft text-brand",
};

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TONE[tone]}`}>
        {label}
      </span>
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}
