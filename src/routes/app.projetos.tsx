import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  LayoutGrid,
  Columns3,
  Pencil,
  Eye,
  Rocket,
  Copy,
  Trash2,
  MoreHorizontal,
  Search,
  Wand2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { projectsApi } from "@/lib/api";
import type { Project, ProjectStatus } from "@/lib/types";
import { EmptyState } from "@/components/global";
import {
  PROJECT_STATUS_LABEL,
  PROJECT_STATUS_DOT,
  PROJECT_STATUS_TONE,
  KANBAN_COLUMNS,
  type StatusTone,
} from "@/lib/status";

export const Route = createFileRoute("/app/projetos")({
  head: () => ({ meta: [{ title: "Meus sites — Publiciart Builder" }] }),
  component: ProjectsPage,
});

const STATUS_FILTERS: { id: "all" | ProjectStatus; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "draft", label: "Rascunho" },
  { id: "briefing_pending", label: "Briefing" },
  { id: "generating", label: "Gerando" },
  { id: "editing", label: "Em edição" },
  { id: "review", label: "Em revisão" },
  { id: "published", label: "Publicado" },
  { id: "archived", label: "Arquivado" },
];

const TONE_RING: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  brand: "bg-brand/15 text-brand",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  violet: "bg-violet/15 text-violet",
  gold: "bg-gold/15 text-gold",
};

function ProjectsPage() {
  const { user, can } = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [view, setView] = useState<"grid" | "kanban">("grid");
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]["id"]>("all");
  const [query, setQuery] = useState("");

  async function refresh() {
    if (!user) return;
    const list = can("projects.viewAll")
      ? await projectsApi.listAll()
      : await projectsApi.listForUser(user.id);
    setProjects(list);
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, can]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      const matchesStatus = filter === "all" ? true : p.status === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || p.title.toLowerCase().includes(q) || p.segment.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [projects, filter, query]);

  async function handleDuplicate(p: Project) {
    if (!user) return;
    await projectsApi.create({
      user_id: user.id,
      title: `${p.title} (cópia)`,
      business_name: p.business_name,
      segment: p.segment,
      objective: p.objective,
      template_id: p.template_id,
      status: "draft",
    });
    await refresh();
  }

  async function handleDelete(p: Project) {
    if (!confirm(`Excluir o projeto "${p.title}"? Essa ação não pode ser desfeita.`)) return;
    await projectsApi.remove(p.id);
    await refresh();
  }

  async function handlePublish(p: Project) {
    await projectsApi.update(p.id, { status: "published" });
    await refresh();
  }

  async function moveTo(p: Project, status: ProjectStatus) {
    await projectsApi.update(p.id, { status });
    await refresh();
  }

  if (!user || !projects) {
    return <p className="text-sm text-muted-foreground">Carregando seus projetos...</p>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-bold">Meus sites</h2>
          <p className="text-sm text-muted-foreground">
            {can("projects.viewAll")
              ? "Você está vendo todos os projetos da plataforma."
              : "Sua linha de produção, organizada num só lugar."}
          </p>
        </div>
        <Link
          to="/app/criador"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-brand-gradient px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/25"
        >
          <Plus className="h-4 w-4" /> Novo
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou segmento..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
          <ViewToggle current={view} onClick={() => setView("grid")} value="grid" label="Grade" icon={LayoutGrid} />
          <ViewToggle current={view} onClick={() => setView("kanban")} value="kanban" label="Esteira" icon={Columns3} />
        </div>
      </div>

      {/* Status filter pills */}
      {view === "grid" && (
        <div className="-mx-1 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => {
            const count =
              f.id === "all" ? projects.length : projects.filter((p) => p.status === f.id).length;
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-brand-gradient text-white shadow-md shadow-brand/20"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/20" : "bg-muted"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {projects.length === 0 ? (
        <EmptyState
          title="Você ainda não criou nenhum site"
          description="Comece respondendo um briefing rápido. A IA cuida do trabalho pesado."
          action={
            <Link
              to="/app/criador"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
            >
              <Wand2 className="h-4 w-4" /> Criar primeiro site
            </Link>
          }
        />
      ) : view === "grid" ? (
        filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Nenhum projeto neste filtro.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProjectGridCard
                key={p.id}
                project={p}
                onDuplicate={() => handleDuplicate(p)}
                onDelete={() => handleDelete(p)}
                onPublish={() => handlePublish(p)}
              />
            ))}
          </div>
        )
      ) : (
        <KanbanBoard projects={projects} onMove={moveTo} />
      )}
    </div>
  );
}

function ViewToggle({
  current,
  value,
  onClick,
  label,
  icon: Icon,
}: {
  current: string;
  value: string;
  onClick: () => void;
  label: string;
  icon: typeof LayoutGrid;
}) {
  const active = current === value;
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
        active ? "bg-brand-soft text-brand" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function ProjectGridCard({
  project,
  onDuplicate,
  onDelete,
  onPublish,
}: {
  project: Project;
  onDuplicate: () => void;
  onDelete: () => void;
  onPublish: () => void;
}) {
  const tone = PROJECT_STATUS_TONE[project.status];
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5">
      <div
        className="relative aspect-video w-full"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.62 0.24 295), oklch(0.66 0.22 255) 55%, oklch(0.72 0.2 45))",
        }}
      >
        <div className="absolute left-3 top-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-white/15 ${TONE_RING[tone]}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${PROJECT_STATUS_DOT[project.status]}`} />
            {PROJECT_STATUS_LABEL[project.status]}
          </span>
        </div>
        <div className="absolute right-3 top-3">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-8 w-8 place-items-center rounded-full bg-black/30 text-white opacity-0 transition group-hover:opacity-100"
              aria-label="Mais ações"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div
                onMouseLeave={() => setMenuOpen(false)}
                className="absolute right-0 top-9 z-10 w-44 overflow-hidden rounded-lg border border-border bg-card text-foreground shadow-lg"
              >
                <MenuItem icon={Copy} label="Duplicar" onClick={onDuplicate} />
                <MenuItem icon={Trash2} label="Excluir" onClick={onDelete} danger />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display font-semibold">{project.title}</h3>
            <p className="truncate text-xs text-muted-foreground">{project.segment}</p>
          </div>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {new Date(project.updated_at).toLocaleDateString("pt-BR")}
          </span>
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Template: {project.template_id ?? "Sem template"}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-1.5">
          <ActionBtn icon={Pencil} label="Editar" to="/app/criador" />
          <ActionBtn icon={Eye} label="Ver" to="/app/projetos" />
          <ActionBtn
            icon={Rocket}
            label={project.status === "published" ? "Publicado" : "Publicar"}
            onClick={onPublish}
            primary={project.status !== "published"}
          />
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Copy;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted ${
        danger ? "text-destructive" : ""
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  to,
  primary,
}: {
  icon: typeof Pencil;
  label: string;
  onClick?: () => void;
  to?: string;
  primary?: boolean;
}) {
  const cls = `inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition ${
    primary
      ? "bg-brand-gradient text-white hover:opacity-90"
      : "bg-muted text-foreground hover:bg-muted/70"
  }`;
  if (to)
    return (
      <Link to={to} className={cls}>
        <Icon className="h-3.5 w-3.5" /> {label}
      </Link>
    );
  return (
    <button onClick={onClick} className={cls}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

/* ============ Kanban ============ */

function KanbanBoard({
  projects,
  onMove,
}: {
  projects: Project[];
  onMove: (p: Project, status: ProjectStatus) => void;
}) {
  return (
    <div className="-mx-2 overflow-x-auto pb-3">
      <div className="flex min-w-max gap-3 px-2">
        {KANBAN_COLUMNS.map((col) => {
          const items = projects.filter((p) => p.status === col.id);
          return (
            <div
              key={col.id}
              className="flex w-72 shrink-0 flex-col rounded-2xl border border-border bg-card"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-sm font-semibold">{col.title}</h3>
                  <p className="truncate text-[11px] text-muted-foreground">{col.sub}</p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">
                  {items.length}
                </span>
              </div>
              <div className="flex-1 space-y-2 p-3">
                {items.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border p-3 text-center text-[11px] text-muted-foreground">
                    Vazio
                  </p>
                ) : (
                  items.map((p) => <KanbanCard key={p.id} project={p} onMove={onMove} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCard({
  project,
  onMove,
}: {
  project: Project;
  onMove: (p: Project, status: ProjectStatus) => void;
}) {
  const idx = KANBAN_COLUMNS.findIndex((c) => c.id === project.status);
  const prev = idx > 0 ? KANBAN_COLUMNS[idx - 1] : null;
  const next = idx >= 0 && idx < KANBAN_COLUMNS.length - 1 ? KANBAN_COLUMNS[idx + 1] : null;
  return (
    <div className="group rounded-xl border border-border bg-background p-3 transition hover:border-brand/40 hover:shadow-md">
      <p className="truncate font-display text-sm font-semibold">{project.title}</p>
      <p className="truncate text-[11px] text-muted-foreground">{project.segment}</p>
      <div className="mt-3 flex items-center gap-1">
        <button
          disabled={!prev}
          onClick={() => prev && onMove(project, prev.id)}
          className="rounded-md bg-muted px-2 py-1 text-[10px] font-semibold text-foreground transition hover:bg-muted/70 disabled:opacity-40"
          title={prev ? `Mover para ${prev.title}` : "Início da esteira"}
        >
          ←
        </button>
        <button
          disabled={!next}
          onClick={() => next && onMove(project, next.id)}
          className="flex-1 rounded-md bg-brand-soft px-2 py-1 text-[10px] font-semibold text-brand transition hover:bg-brand/20 disabled:opacity-40"
          title={next ? `Mover para ${next.title}` : "Fim da esteira"}
        >
          {next ? `→ ${next.title}` : "Última etapa"}
        </button>
      </div>
    </div>
  );
}
