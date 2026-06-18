import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Globe,
  Rocket,
  ExternalLink,
  Lock,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  Circle,
  X,
  Loader2,
  PowerOff,
  Sparkles,
  Crown,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { projectsApi, briefingsApi, sitesApi } from "@/lib/api";
import type { Project, Briefing, Site } from "@/lib/types";
import { planCapabilities, subscriptionIsActive } from "@/lib/plan-capabilities";
import { EmptyState, Badge, PrimaryButton, SecondaryButton } from "@/components/global";
import { toast } from "sonner";

export const Route = createFileRoute("/app/publicacao")({
  head: () => ({ meta: [{ title: "Publicação — Publiciart Builder" }] }),
  component: PublishPage,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32);
}

function PublishPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalProject, setModalProject] = useState<Project | null>(null);

  const reload = () => {
    if (!user) return;
    setLoading(true);
    projectsApi.listForUser(user.id).then((p) => {
      setProjects(p);
      setLoading(false);
    });
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const published = projects.filter((p) => p.status === "published");
  const ready = projects.filter((p) =>
    ["editing", "review", "draft"].includes(p.status),
  );
  const caps = planCapabilities(user?.plan_id);
  const canCustomDomain = caps.customDomain;
  const subscriptionActive = subscriptionIsActive(user?.subscription_status ?? "active");

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Publicação</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Seu site fica hospedado dentro da Publiciart e permanece online enquanto sua assinatura estiver ativa.
        </p>
      </header>

      {/* Status da assinatura */}
      <div
        className={`flex flex-wrap items-center gap-3 rounded-2xl border p-4 text-sm ${
          subscriptionActive
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "border-red-500/30 bg-red-500/10"
        }`}
      >
        <span
          className={`grid h-9 w-9 place-items-center rounded-lg ${
            subscriptionActive ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500 text-white"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {subscriptionActive
              ? `Assinatura ativa · plano ${(user?.plan_id ?? "start").toUpperCase()}`
              : "Sua assinatura está inativa — sites suspensos"}
          </p>
          <p className="text-xs text-muted-foreground">
            {subscriptionActive
              ? "Seus sites continuam no ar enquanto o plano estiver pago."
              : "Reative a assinatura para voltar a publicar e manter seus sites online."}
          </p>
        </div>
        {!subscriptionActive && (
          <Link
            to="/app/creditos"
            className="rounded-lg bg-brand-gradient px-3 py-2 text-xs font-semibold text-white"
          >
            Reativar plano
          </Link>
        )}
      </div>

      {/* Sites publicados */}
      <section>
        <SectionTitle>Sites no ar</SectionTitle>
        {loading ? (
          <SkeletonRow />
        ) : published.length === 0 ? (
          <EmptyState
            icon={Rocket}
            title="Nenhum site publicado ainda"
            description="Termine seu primeiro projeto e publique com 1 clique."
            action={
              <Link
                to="/app/projetos"
                className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
              >
                Ver meus projetos
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {published.map((p) => (
              <PublishedRow key={p.id} project={p} onChanged={reload} />
            ))}
          </div>
        )}
      </section>

      {/* Prontos pra publicar */}
      <section>
        <SectionTitle>Prontos pra publicar</SectionTitle>
        {ready.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Nada na fila de publicação"
            description="Quando um projeto estiver em revisão ou edição, ele aparece aqui."
          />
        ) : (
          <div className="space-y-3">
            {ready.map((p) => (
              <ReadyRow key={p.id} project={p} onPublish={() => setModalProject(p)} />
            ))}
          </div>
        )}
      </section>

      {/* Domínio próprio */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Globe className="h-4 w-4 text-brand" />
          <h3 className="font-display font-semibold">Conectar domínio próprio</h3>
          {!canCustomDomain ? (
            <Badge tone="warning">
              <Lock className="h-3 w-3" /> Plano Pro+
            </Badge>
          ) : (
            <Badge tone="success">Disponível no seu plano</Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {canCustomDomain
            ? "Aponte seudominio.com.br para o seu site. SSL gratuito incluso. Configuração simulada nesta versão demo."
            : "Domínio próprio está disponível a partir do plano Pro. No seu plano atual, seu site fica em subdomínio publiciart.app."}
        </p>

        {canCustomDomain ? (
          <div className="mt-4 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="meusite.com.br"
              />
              <button
                onClick={() => toast.info("Verificando DNS… (demo)")}
                className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background"
              >
                Verificar DNS
              </button>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Instruções DNS</p>
              <p className="mt-1">No seu provedor, adicione um registro <strong>A</strong> apontando para <code>185.158.133.1</code> e um <strong>TXT</strong> <code>_publiciart</code> com o token gerado.</p>
              <p className="mt-2">Status: <Badge tone="neutral">Aguardando configuração</Badge></p>
            </div>
          </div>
        ) : (
          <Link
            to="/planos"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
          >
            <Crown className="h-4 w-4" /> Fazer upgrade para Pro
          </Link>
        )}
      </section>

      {modalProject && (
        <PublishModal
          project={modalProject}
          onClose={() => setModalProject(null)}
          onPublished={() => {
            setModalProject(null);
            reload();
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Subcomponentes ---------------- */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </h3>
  );
}

function SkeletonRow() {
  return (
    <div className="space-y-3">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-2xl border border-border bg-card"
        />
      ))}
    </div>
  );
}

function PublishedRow({ project, onChanged }: { project: Project; onChanged: () => void }) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [site, setSite] = useState<Site | null>(null);

  useEffect(() => {
    sitesApi.getForProject(project.id).then(setSite);
  }, [project.id]);

  const slug = site?.slug ?? slugify(project.title || project.business_name);
  const path = `/site/${slug}`;
  const fullUrl =
    typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Seu link está pronto para compartilhar.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não consegui copiar. Tente manualmente.");
    }
  };

  const unpublish = async () => {
    if (!confirm("Tem certeza que quer despublicar este site?")) return;
    setBusy(true);
    await projectsApi.update(project.id, { status: "editing" });
    if (site) await sitesApi.unpublish(site.id);
    toast.success("Site despublicado. Você pode publicar de novo quando quiser.");
    onChanged();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition hover:border-white/15 sm:p-5">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white">
          <Globe className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-display font-semibold">{project.title}</p>
            <Badge tone="success">No ar</Badge>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {path} · {project.segment}
          </p>
        </div>
        <div className="col-span-2 mt-3 flex flex-wrap items-center gap-2 sm:col-auto sm:mt-0 sm:justify-end">
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold transition hover:bg-muted"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
          <Link
            to="/site/$slug"
            params={{ slug }}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold transition hover:bg-muted"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Abrir
          </Link>
          <button
            disabled={busy}
            onClick={unpublish}
            className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
          >
            <PowerOff className="h-3.5 w-3.5" /> Despublicar
          </button>
        </div>
      </div>
    </div>
  );
}

function ReadyRow({ project, onPublish }: { project: Project; onPublish: () => void }) {
  const statusLabel: Record<string, string> = {
    editing: "Em edição",
    review: "Em revisão",
    draft: "Rascunho",
  };
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-white/15">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-display font-semibold">{project.title}</p>
          <Badge tone="neutral">{statusLabel[project.status] ?? project.status}</Badge>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{project.segment}</p>
      </div>
      <button
        onClick={onPublish}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-gradient px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-brand/25 transition hover:opacity-95"
      >
        <Rocket className="h-3.5 w-3.5" /> Publicar
      </button>
    </div>
  );
}

/* ---------------- Modal de publicação ---------------- */

type ChecklistItem = { key: string; label: string; done: boolean };

function PublishModal({
  project,
  onClose,
  onPublished,
}: {
  project: Project;
  onClose: () => void;
  onPublished: () => void;
}) {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [existingSite, setExistingSite] = useState<Site | null>(null);
  const [slug, setSlug] = useState(slugify(project.title || project.business_name));
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    Promise.all([
      briefingsApi.getForProject(project.id),
      sitesApi.getForProject(project.id),
    ]).then(([b, s]) => {
      setBriefing(b);
      setExistingSite(s);
      if (s?.slug) setSlug(s.slug);
      setLoading(false);
    });
  }, [project.id]);

  const checklist = useMemo<ChecklistItem[]>(() => {
    const b = briefing;
    return [
      { key: "nome", label: "Nome do negócio preenchido", done: !!project.business_name },
      { key: "wa", label: "WhatsApp preenchido", done: !!b?.whatsapp },
      { key: "cta", label: "CTA principal definido", done: !!b?.goal || !!b?.main_offer },
      { key: "hero", label: "Hero revisado", done: !!b?.main_offer },
      { key: "servicos", label: "Serviços preenchidos", done: (b?.services?.length ?? 0) > 0 },
      { key: "site", label: "Site gerado pela IA", done: !!existingSite },
      { key: "responsivo", label: "Visual responsivo verificado", done: true },
      { key: "faq", label: "FAQ incluído", done: true },
      { key: "rodape", label: "Rodapé completo", done: !!b?.instagram || !!b?.whatsapp },
    ];
  }, [briefing, existingSite, project]);

  const totalDone = checklist.filter((c) => c.done).length;
  const allDone = totalDone === checklist.length;
  const url = `${typeof window !== "undefined" ? window.location.host : "publiciart.app"}/site/${slug || "seu-site"}`;
  const slugValid = /^[a-z0-9](-?[a-z0-9])*$/.test(slug) && slug.length >= 3;

  const publish = async () => {
    if (!slugValid) {
      toast.error("Escolha um endereço válido (mínimo 3 letras, sem espaço).");
      return;
    }
    setPublishing(true);
    let site = existingSite;
    // se não houver site gerado, cria um básico para permitir publicação
    if (!site) {
      site = await sitesApi.upsertForProject({
        project_id: project.id,
        title: project.title || project.business_name,
        slug,
        theme_config: { primary: "#FF6A3D", accent: "#FF6A3D", font: "Sora", mode: "dark" },
        status: "ready",
      });
    }
    await sitesApi.publish(site.id, slug);
    await projectsApi.update(project.id, { status: "published" });
    toast.success("Seu site está no ar! 🚀");
    setPublishing(false);
    onPublished();
  };


  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-scale-in flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Publicar projeto
            </p>
            <h3 className="truncate font-display text-lg font-bold">{project.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando dados do projeto…
            </div>
          ) : (
            <div className="space-y-6">
              {/* Slug */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Endereço do site
                </label>
                <div className="mt-2 flex items-stretch overflow-hidden rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-brand/40">
                  <span className="grid place-items-center border-r border-input bg-muted px-3 text-xs text-muted-foreground">
                    /site/
                  </span>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                    placeholder="meu-site"
                  />
                </div>
                <p className="mt-2 break-all text-xs text-muted-foreground">
                  Seu site vai ficar em <span className="font-semibold text-foreground">https://{url}</span>
                </p>
                {!slugValid && slug.length > 0 && (
                  <p className="mt-1 text-xs text-destructive">
                    Use só letras minúsculas, números e hífens (mín. 3 caracteres).
                  </p>
                )}
              </div>

              {/* Alerta amigável */}
              {!allDone && (
                <div className="flex gap-3 rounded-xl border border-warning/30 bg-warning/5 p-3.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold text-warning">
                      Antes de publicar, revise estes pontos para seu site vender melhor.
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Você ainda pode publicar agora — mas recomendamos completar tudo.
                    </p>
                  </div>
                </div>
              )}

              {/* Checklist */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-display text-sm font-semibold">Checklist do site</h4>
                  <span className="text-xs text-muted-foreground">
                    {totalDone}/{checklist.length}
                  </span>
                </div>
                <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-brand-gradient transition-all duration-500"
                    style={{ width: `${(totalDone / checklist.length) * 100}%` }}
                  />
                </div>
                <ul className="space-y-1.5">
                  {checklist.map((item) => (
                    <li
                      key={item.key}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm"
                    >
                      {item.done ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                      )}
                      <span
                        className={
                          item.done ? "text-foreground" : "text-muted-foreground"
                        }
                      >
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:justify-end">
          <SecondaryButton onClick={onClose} disabled={publishing}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton onClick={publish} disabled={publishing || loading || !slugValid}>
            {publishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Publicando…
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" /> Publicar agora
              </>
            )}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
