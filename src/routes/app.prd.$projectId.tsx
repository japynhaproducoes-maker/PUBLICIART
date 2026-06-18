import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Sparkles, CheckCircle2, ChevronRight, Users, Megaphone,
  Palette, TrendingUp, Loader2, AlertCircle, ArrowLeft, Shield,
} from "lucide-react";
import { prdApi } from "@/lib/api";
import type { SquadPRD } from "@/lib/prd";
import { toast } from "sonner";

export const Route = createFileRoute("/app/prd/$projectId")({
  head: () => ({ meta: [{ title: "Análise Estratégica — Publiciart Builder" }] }),
  component: PRDPage,
});

type Phase = "loading" | "analyzing" | "ready" | "approving" | "error";

const SQUAD_STEPS = [
  { label: "Brand Squad analisando posicionamento…", icon: Shield },
  { label: "Copy Squad criando headlines…", icon: Megaphone },
  { label: "Data Squad mapeando a persona…", icon: Users },
  { label: "Design Squad definindo arquitetura…", icon: Palette },
  { label: "Compilando o PRD…", icon: Sparkles },
];

function AnalyzingState({ step }: { step: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-24">
      <div className="h-20 w-20 rounded-2xl bg-brand/10 flex items-center justify-center">
        <Sparkles className="h-8 w-8 text-brand animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl font-bold">Squads trabalhando…</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          4 especialistas analisando seu negócio em paralelo para criar um PRD sob medida.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {SQUAD_STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const done = i < step;
          return (
            <div key={i} className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-500 ${done ? "border-brand/30 bg-brand/5 opacity-60" : active ? "border-brand/50 bg-brand/10" : "border-border opacity-30"}`}>
              {done ? <CheckCircle2 className="h-4 w-4 text-brand flex-shrink-0" /> : active ? <Loader2 className="h-4 w-4 text-brand animate-spin flex-shrink-0" /> : <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
              <span className={`text-sm ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand border border-brand/20">{children}</span>;
}

function Section({ icon: Icon, title, color, children }: { icon: React.ElementType; title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${color}`}><Icon className="h-4 w-4" /></div>
        <h3 className="font-display text-lg font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground leading-relaxed">{value}</p>
    </div>
  );
}

function TagList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">{items.map((item, i) => <Tag key={i}>{item}</Tag>)}</div>
    </div>
  );
}

function BulletList({ label, items, tone = "default" }: { label: string; items: string[]; tone?: "pain" | "desire" | "default" }) {
  const dot = tone === "pain" ? "bg-red-400" : tone === "desire" ? "bg-emerald-400" : "bg-brand";
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${dot}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PRDView({ prd, onApprove }: { prd: SquadPRD; projectId: string; onApprove: () => void }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-brand/30 bg-brand/5 p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-brand/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-brand" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">PRD — Análise Estratégica</h2>
            <p className="text-sm text-muted-foreground mt-1">4 squads analisaram seu briefing. Revise e aprove para gerar o site com esse contexto estratégico.</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-gradient-to-br from-surface/60 to-surface/20 p-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Copy Squad · Headline Principal</p>
        <p className="font-display text-2xl font-bold text-foreground leading-tight">"{prd.copy.hero_headline}"</p>
        <p className="text-base text-muted-foreground">{prd.copy.hero_subheadline}</p>
        <div className="pt-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white">
            {prd.copy.primary_cta}<ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Section icon={Shield} title="Brand Squad" color="bg-violet-500/10 text-violet-400">
          <Row label="Posicionamento" value={prd.brand.positioning} />
          <Row label="Proposta de Valor" value={prd.brand.value_proposition} />
          <Row label="Tom de Voz" value={prd.brand.tone_of_voice} />
          <TagList label="Personalidade" items={prd.brand.brand_personality} />
          <TagList label="Diferenciais" items={prd.brand.key_differentiators} />
          <Row label="Arquétipo" value={prd.brand.archetype} />
        </Section>

        <Section icon={Users} title="Data Squad · Persona" color="bg-blue-500/10 text-blue-400">
          <Row label="Persona Principal" value={prd.audience.primary_persona} />
          <Row label="Faixa Etária" value={prd.audience.age_range} />
          <Row label="Gatilho de Compra" value={prd.audience.buying_trigger} />
          <BulletList label="Medos" items={prd.audience.main_fears} tone="pain" />
          <BulletList label="Desejos" items={prd.audience.main_desires} tone="desire" />
          <BulletList label="Objeções" items={prd.audience.objections} />
        </Section>

        <Section icon={Megaphone} title="Copy Squad · Argumentos" color="bg-orange-500/10 text-orange-400">
          <Row label="Sobre o Negócio" value={prd.copy.about_paragraph} />
          <BulletList label="Dores do Cliente" items={prd.copy.pain_points} tone="pain" />
          <BulletList label="Desejos do Cliente" items={prd.copy.desires} tone="desire" />
          <Row label="Ângulo de Prova Social" value={prd.copy.social_proof_angle} />
        </Section>

        <Section icon={Palette} title="Design Squad · Arquitetura" color="bg-emerald-500/10 text-emerald-400">
          <Row label="Estilo Visual" value={prd.design.recommended_style} />
          <Row label="Justificativa de Cores" value={prd.design.color_rationale} />
          <TagList label="Seções (em ordem)" items={prd.design.sections_order} />
          <BulletList label="Referências Visuais" items={prd.design.visual_references} />
        </Section>
      </div>

      <div className="rounded-2xl border border-border bg-surface/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold">Tudo certo com a análise?</p>
          <p className="text-sm text-muted-foreground">Ao aprovar, o site será gerado com todo esse contexto estratégico.</p>
        </div>
        <button onClick={onApprove} className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 hover:opacity-90 transition-opacity whitespace-nowrap">
          <CheckCircle2 className="h-4 w-4" />
          Aprovar e Gerar Site
        </button>
      </div>
    </div>
  );
}

function PRDPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("loading");
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const [prd, setPrd] = useState<SquadPRD | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const existing = await prdApi.get(projectId);
        if (!cancelled) { setPrd(existing.prd); setPhase("ready"); return; }
      } catch { /* PRD nao existe ainda */ }

      if (cancelled) return;
      setPhase("analyzing");

      let step = 0;
      const timer = setInterval(() => {
        step++;
        if (!cancelled) setAnalyzingStep(step);
        if (step >= SQUAD_STEPS.length - 1) clearInterval(timer);
      }, 700);

      try {
        const result = await prdApi.analyze(projectId);
        clearInterval(timer);
        if (!cancelled) {
          setPrd(result.prd);
          setAnalyzingStep(SQUAD_STEPS.length);
          setTimeout(() => { if (!cancelled) setPhase("ready"); }, 400);
        }
      } catch (e) {
        clearInterval(timer);
        if (!cancelled) { setError(e instanceof Error ? e.message : "Erro ao analisar"); setPhase("error"); }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [projectId]);

  async function handleApprove() {
    setPhase("approving");
    try {
      await prdApi.approve(projectId);
      toast.success("PRD aprovado! Gerando seu site…");
      void navigate({ to: "/app/criador", search: { project: projectId } });
    } catch {
      toast.error("Erro ao aprovar. Tente novamente.");
      setPhase("ready");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => void navigate({ to: "/app/projetos" })} className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />Projetos
        </button>
        <span>/</span>
        <span className="flex items-center gap-1.5 text-foreground">
          <TrendingUp className="h-3.5 w-3.5 text-brand" />Análise Estratégica
        </span>
      </div>

      {phase === "loading" && <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand" /></div>}
      {phase === "analyzing" && <AnalyzingState step={analyzingStep} />}
      {(phase === "ready" || phase === "approving") && prd && <PRDView prd={prd} projectId={projectId} onApprove={handleApprove} />}
      {phase === "approving" && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-brand" />
            <p className="text-sm font-medium">Aprovando e iniciando geração…</p>
          </div>
        </div>
      )}
      {phase === "error" && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="font-semibold">Erro na análise</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={() => window.location.reload()} className="text-sm text-brand hover:underline">Tentar novamente</button>
        </div>
      )}
    </div>
  );
}
