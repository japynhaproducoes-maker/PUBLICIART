import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Sparkles,
  FolderKanban,
  Rocket,
  Coins,
  ArrowRight,
  Plus,
  Wand2,
  LayoutTemplate,
  Megaphone,
  PlayCircle,
  Eye,
  Clock,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { projectsApi } from "@/lib/api";
import type { Project } from "@/lib/types";
import { LimitReachedState } from "@/components/global";
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_DOT } from "@/lib/status";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Visão geral — Publiciart Builder" }] }),
  component: Dashboard,
});

function planLabel(p: string | undefined) {
  return p === "pro" ? "Pro" : p === "business" ? "Business" : p === "full" ? "Publiciart Full" : "Start";
}
function planCap(p: string | undefined) {
  return p === "pro" ? 300 : p === "business" ? 1500 : p === "full" ? 9999 : 30;
}

function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    if (!user) return;
    projectsApi.listForUser(user.id).then(setProjects);
  }, [user]);

  if (!user) return null;
  const published = projects?.filter((p) => p.status === "published").length ?? 0;
  const inReview = projects?.filter((p) => p.status === "review").length ?? 0;
  const total = projects?.length ?? 0;
  const outOfCredits = user.credits_balance <= 0;
  const totalCap = planCap(user.plan_id);
  const lastInProgress = projects?.find((p) =>
    ["editing", "generating", "briefing_pending", "review"].includes(p.status),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Hero greeting */}
      <div className="overflow-hidden rounded-2xl border border-border bg-brand-gradient p-6 text-white sm:p-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
              Olá, {user.name.split(" ")[0]} 👋
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
              Vamos criar algo bom hoje?
            </h2>
            <p className="mt-1 text-sm text-white/80">
              Comece um novo projeto ou continue de onde parou.
            </p>
          </div>
          <Link
            to="/app/criador"
            className="shrink-0 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand"
          >
            <span className="hidden sm:inline">Novo projeto</span>
            <Plus className="inline h-4 w-4 sm:hidden" />
          </Link>
        </div>
      </div>

      {outOfCredits && (
        <LimitReachedState
          action={
            <Link to="/app/creditos" className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white">
              Comprar créditos
            </Link>
          }
        />
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={FolderKanban} label="Total de projetos" value={String(total)} tone="brand" />
        <Stat icon={Rocket} label="Sites publicados" value={String(published)} tone="success" />
        <Stat icon={Eye} label="Em revisão" value={String(inReview)} tone="gold" />
        <Stat
          icon={Coins}
          label="Créditos"
          value={`${user.credits_balance}`}
          hint={`de ${totalCap} no plano ${planLabel(user.plan_id)}`}
          tone="violet"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Ações rápidas
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            icon={Sparkles}
            title="Criar site com IA"
            desc="Responda o briefing no chat."
            to="/app/criador"
            cta="Começar"
            highlight
          />
          <QuickAction
            icon={LayoutTemplate}
            title="Usar template"
            desc="Comece de um modelo pronto."
            to="/app/templates"
            cta="Ver modelos"
          />
          <QuickAction
            icon={PlayCircle}
            title="Continuar projeto"
            desc={lastInProgress?.title ?? "Nenhum em andamento"}
            to="/app/projetos"
            cta={lastInProgress ? "Retomar" : "Ver projetos"}
            disabled={!lastInProgress}
          />
          <QuickAction
            icon={Megaphone}
            title="Serviço extra"
            desc="Logo, vídeo, tráfego e mais."
            to="/app/servicos"
            cta="Contratar"
          />
        </div>
      </div>

      {/* Recent + Shortcuts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Projetos recentes</h3>
            <Link to="/app/projetos" className="text-xs font-semibold text-brand hover:underline">
              Ver todos →
            </Link>
          </div>
          {!projects ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm font-medium">Você ainda não criou nenhum site.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Comece respondendo um briefing rápido.
              </p>
              <Link
                to="/app/criador"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
              >
                <Wand2 className="h-4 w-4" /> Criar primeiro site
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {projects.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.title}</p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{p.segment}</span>
                      <span className="text-border">•</span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="inline-block h-1.5 w-1.5 shrink-0 animate-pulse rounded-full" />
                        <Clock className="h-3 w-3" /> atualizado hoje
                      </span>
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold">
                    <span className={`h-1.5 w-1.5 rounded-full ${PROJECT_STATUS_DOT[p.status]}`} />
                    {PROJECT_STATUS_LABEL[p.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-semibold">Atalhos</h3>
          <div className="mt-4 space-y-2">
            {[
              ["Briefings", "/app/briefings"],
              ["Templates", "/app/templates"],
              ["Publicações", "/app/publicacao"],
              ["Pedidos extras", "/app/servicos"],
              ["Créditos", "/app/creditos"],
            ].map(([label, to]) => (
              <Link
                key={to}
                to={to}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:border-brand/40 hover:bg-brand-soft/40"
              >
                {label}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const TONE_CLASS: Record<string, string> = {
  brand: "bg-brand-soft text-brand",
  success: "bg-success/15 text-success",
  gold: "bg-gold/15 text-gold",
  violet: "bg-violet/15 text-violet",
};

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  tone = "brand",
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
  hint?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className={`grid h-9 w-9 place-items-center rounded-lg ${TONE_CLASS[tone] ?? TONE_CLASS.brand}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  desc,
  to,
  cta,
  highlight,
  disabled,
}: {
  icon: typeof Sparkles;
  title: string;
  desc: string;
  to: string;
  cta: string;
  highlight?: boolean;
  disabled?: boolean;
}) {
  const Inner = (
    <div
      className={`group h-full rounded-2xl border p-5 transition ${
        highlight
          ? "border-brand/40 bg-brand-soft/40 hover:border-brand/60"
          : "border-border bg-card hover:border-brand/30 hover:bg-brand-soft/20"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <div
        className={`grid h-10 w-10 place-items-center rounded-xl ${
          highlight ? "bg-brand-gradient text-white" : "bg-brand-soft text-brand"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="mt-4 font-display font-semibold">{title}</h4>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{desc}</p>
      <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand">
        {cta} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </p>
    </div>
  );
  if (disabled) return <div>{Inner}</div>;
  return <Link to={to}>{Inner}</Link>;
}
