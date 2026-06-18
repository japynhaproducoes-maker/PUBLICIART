import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Send,
  Sparkles,
  MessageSquare,
  Monitor,
  Settings2,
  Smartphone,
  Rocket,
  Wand2,
  Palette,
  Type,
  Layers,
  Phone,
  MapPin,
  Star,
  HelpCircle,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { SERVICE_CATALOG } from "@/lib/orders";
import { useAuth } from "@/lib/auth";
import {
  projectsApi,
  briefingsApi,
  sitesApi,
  sectionsApi,
  creditsApi,
} from "@/lib/api";
import { generateSiteFromBriefing, slugify } from "@/lib/generator";
import { toast } from "sonner";
import { CreditConfirmDialog } from "@/components/credits/credit-confirm-dialog";
import { freeDailyRemaining, type CreditActionType, type EstimateBreakdown } from "@/lib/credits/pricing";


export const Route = createFileRoute("/app/criador")({
  head: () => ({ meta: [{ title: "Criar com IA â€” Publiciart Builder" }] }),
  component: BuilderPage,
});

// ---------------- Types ----------------
type Sender = "ai" | "me";
type ChatMsg = {
  id: string;
  from: Sender;
  text: string;
  chips?: string[];
};
type Status = "briefing" | "generating" | "ready" | "editing" | "error" | "no-credits" | "published";

type Briefing = {
  nome: string;
  segmento: string;
  cidade: string;
  servico: string;
  objetivo: string;
  publico: string;
  estilo: string;
  whatsapp: string;
  social: string;
  diferenciais: string;
  provas: string;
  oferta: string;
};

type Step = { key: keyof Briefing; question: string; chips?: string[] };

const STEPS: Step[] = [
  { key: "nome", question: "OlÃ¡! Eu sou a IA do Publiciart Builder. Vou te ajudar a criar um site profissional. Primeiro, me diga: qual Ã© o nome do seu negÃ³cio?" },
  { key: "segmento", question: "Perfeito! E qual Ã© o segmento?", chips: ["Barbearia", "EstÃ©tica", "Restaurante", "Evento", "Artista", "Loja local", "Advocacia", "Oficina"] },
  { key: "cidade", question: "Em qual cidade vocÃªs atendem?" },
  { key: "servico", question: "Qual Ã© o produto ou serviÃ§o principal que vocÃª quer destacar?" },
  { key: "objetivo", question: "Qual Ã© o objetivo principal desse site?", chips: ["Vender serviÃ§o", "Captar leads", "Divulgar evento", "Apresentar portfÃ³lio", "WhatsApp", "Vender produto", "Fortalecer marca"] },
  { key: "publico", question: "Quem Ã© seu pÃºblico-alvo? (idade, perfil, regiÃ£o)" },
  { key: "estilo", question: "Qual estilo visual combina mais com vocÃª?", chips: ["Moderno escuro", "Clean claro", "Premium dourado", "Urbano", "Minimalista", "Vibrante"] },
  { key: "whatsapp", question: "Qual Ã© o WhatsApp para contato? (com DDD)" },
  { key: "social", question: "Tem Instagram ou site atual? Pode colar o link (ou diga 'nÃ£o tenho')." },
  { key: "diferenciais", question: "Quais sÃ£o os seus 3 maiores diferenciais?" },
  { key: "provas", question: "Tem depoimentos, prÃªmios ou nÃºmeros legais para mostrar? Me conta um." },
  { key: "oferta", question: "Por Ãºltimo: qual oferta principal vamos destacar no site?" },
];

const QUICK_ACTIONS: { label: string; icon: typeof Rocket; action: CreditActionType | null }[] = [
  { label: "Gerar site", icon: Rocket, action: "generate_site" },
  { label: "Melhorar copy", icon: Wand2, action: "improve_copy" },
  { label: "Deixar mais premium", icon: Sparkles, action: "change_style" },
  { label: "Adicionar WhatsApp", icon: Phone, action: null },
  { label: "Criar pÃ¡gina de vendas", icon: Layers, action: "sales_page" },
  { label: "Trocar estilo", icon: Palette, action: "change_style" },
  { label: "Adicionar depoimentos", icon: Star, action: "regen_section" },
  { label: "Criar seÃ§Ã£o de planos", icon: Layers, action: "regen_section" },
  { label: "Gerar FAQ", icon: HelpCircle, action: "generate_faq" },
];

const SECTIONS = [
  "Hero",
  "Sobre",
  "ServiÃ§os",
  "BenefÃ­cios",
  "Diferenciais",
  "Galeria",
  "Depoimentos",
  "CTA WhatsApp",
  "LocalizaÃ§Ã£o",
  "FAQ",
  "RodapÃ©",
];

const PALETTES = [
  { name: "Grafite", bg: "#0F1115", accent: "#FF6A3D" },
  { name: "Noite", bg: "#0B1020", accent: "#7C5CFF" },
  { name: "Premium", bg: "#101010", accent: "#D4AF37" },
  { name: "Claro", bg: "#F7F7F5", accent: "#FF6A3D" },
];

const FONTS = ["Sora", "Inter", "Manrope", "Playfair"];

const TEMPLATES = ["ConversÃ£o", "PortfÃ³lio", "Evento", "Loja local", "Landing"];

// ---------------- Page ----------------
function BuilderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"chat" | "preview" | "ajustes">("chat");
  const [status, setStatus] = useState<Status>("briefing");
  const [stepIdx, setStepIdx] = useState(0);
  const [briefing, setBriefing] = useState<Briefing>({
    nome: "", segmento: "", cidade: "", servico: "", objetivo: "",
    publico: "", estilo: "", whatsapp: "", social: "", diferenciais: "", provas: "", oferta: "",
  });
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: "m0", from: "ai", text: STEPS[0].question, chips: STEPS[0].chips },
  ]);
  const [input, setInput] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [, setPublishedSlug] = useState<string | null>(null);

  // Credit confirm dialog
  const [pendingEstimate, setPendingEstimate] = useState<EstimateBreakdown | null>(null);
  const [pendingExec, setPendingExec] = useState<(() => void) | null>(null);

  function requestCreditAction(action: CreditActionType, ctxText: string, exec: () => void, opts?: { sections?: number; isRegeneration?: boolean }) {
    if (!user) {
      toast.error("FaÃ§a login para continuar.");
      return;
    }
    // Bloqueio automÃ¡tico do limite diÃ¡rio do plano gratuito
    if (user.plan_id === "start") {
      const remaining = freeDailyRemaining("start") ?? 0;
      if (remaining <= 0) {
        toast.error("Limite diÃ¡rio atingido. FaÃ§a upgrade para continuar criando hoje.");
        return;
      }
    }
    const est = creditsApi.estimate({
      action,
      planId: user.plan_id,
      promptText: ctxText,
      sections: opts?.sections,
      isRegeneration: opts?.isRegeneration,
    });
    setPendingEstimate(est);
    setPendingExec(() => exec);
  }

  async function confirmPending() {
    if (!user || !pendingEstimate || !pendingExec) return;
    const result = await creditsApi.consumeForAction({
      userId: user.id,
      action: pendingEstimate.action,
      estimate: pendingEstimate,
      projectId,
    });
    if (!result.ok) {
      toast.error("NÃ£o foi possÃ­vel consumir crÃ©ditos.");
      setPendingEstimate(null);
      setPendingExec(null);
      return;
    }
    const exec = pendingExec;
    setPendingEstimate(null);
    setPendingExec(null);
    exec();
  }

  // Settings
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [fontIdx, setFontIdx] = useState(0);
  const [templateIdx, setTemplateIdx] = useState(0);
  const [activeSections, setActiveSections] = useState<string[]>(SECTIONS);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [cta, setCta] = useState("Falar no WhatsApp");

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const palette = PALETTES[paletteIdx];
  const font = FONTS[fontIdx];

  function pushAI(text: string, chips?: string[]) {
    setMessages((m) => [...m, { id: crypto.randomUUID(), from: "ai", text, chips }]);
  }
  function pushMe(text: string) {
    setMessages((m) => [...m, { id: crypto.randomUUID(), from: "me", text }]);
  }

  function answer(value: string) {
    if (!value.trim()) return;
    pushMe(value);
    setInput("");

    if (stepIdx < STEPS.length) {
      const current = STEPS[stepIdx];
      setBriefing((b) => ({ ...b, [current.key]: value }));
      const next = stepIdx + 1;
      setStepIdx(next);

      if (next < STEPS.length) {
        setTimeout(() => pushAI(STEPS[next].question, STEPS[next].chips), 350);
      } else {
        setTimeout(() => {
          pushAI("Briefing completo! Posso gerar seu site agora?", ["Gerar site", "Revisar respostas"]);
        }, 400);
      }
    } else {
      // Free-form edit mode â€” respostas mais inteligentes por comando
      smartReply(value);
    }
  }

  function smartReply(text: string) {
    const t = text.toLowerCase();
    setStatus("editing");
    let reply = "Feito! Apliquei os ajustes no preview.";

    if (/copy|texto|escrita/.test(t)) {
      reply = "Reescrevi a copy com tom mais direto e persuasivo. Confere no preview.";
    } else if (/premium|sofistic|elegant/.test(t)) {
      setPaletteIdx(2);
      reply = "Elevei o nÃ­vel: paleta premium dourada aplicada com tipografia mais sÃ³bria.";
    } else if (/depoiment/.test(t)) {
      if (!activeSections.includes("Depoimentos")) toggleSection("Depoimentos");
      reply = "Adicionei uma seÃ§Ã£o de depoimentos com prova social.";
    } else if (/faq|pergunta/.test(t)) {
      if (!activeSections.includes("FAQ")) toggleSection("FAQ");
      reply = "IncluÃ­ uma seÃ§Ã£o de perguntas frequentes para tirar dÃºvidas do cliente.";
    } else if (/p[Ã¡a]gina de vendas|sales/.test(t)) {
      reply = "Reorganizei como pÃ¡gina de vendas: hero forte, prova social, oferta e CTA repetido.";
    } else if (/plano|pricing|pre[Ã§c]o/.test(t)) {
      reply = "Adicionei uma seÃ§Ã£o de planos com 3 opÃ§Ãµes e CTA para WhatsApp.";
    } else if (/estilo|cor|paleta/.test(t)) {
      setPaletteIdx((i) => (i + 1) % PALETTES.length);
      reply = "Troquei a paleta para um estilo diferente. O que achou?";
    } else if (/whatsapp|whats/.test(t)) {
      reply = "Reforcei o CTA do WhatsApp no hero, no meio e no rodapÃ©.";
    }

    setTimeout(() => {
      pushAI(reply);
      setStatus("ready");
    }, 700);
  }

  async function persistEverything(generated: Awaited<ReturnType<typeof generateSiteFromBriefing>>) {
    if (!user) return null;
    // 1. cria/atualiza o projeto
    let pid = projectId;
    if (!pid) {
      const proj = await projectsApi.create({
        user_id: user.id,
        title: briefing.nome,
        business_name: briefing.nome,
        segment: briefing.segmento,
        objective: briefing.objetivo,
        template_id: null,
        status: "editing",
      });
      pid = proj.id;
      setProjectId(pid);
    } else {
      await projectsApi.update(pid, {
        title: briefing.nome,
        business_name: briefing.nome,
        segment: briefing.segmento,
        objective: briefing.objetivo,
        status: "editing",
      });
    }
    // 2. salva briefing
    await briefingsApi.save({
      id: `brf-${pid}`,
      project_id: pid,
      business_name: briefing.nome,
      segment: briefing.segmento,
      city: briefing.cidade,
      target_audience: briefing.publico,
      main_offer: briefing.oferta,
      services: briefing.servico ? [briefing.servico] : [],
      whatsapp: briefing.whatsapp,
      instagram: briefing.social,
      visual_style: briefing.estilo,
      goal: briefing.objetivo,
      notes: `${briefing.diferenciais}\n${briefing.provas}`.trim(),
    });
    // 3. cria/atualiza site
    const site = await sitesApi.upsertForProject({
      project_id: pid,
      title: generated.title,
      slug: generated.slug,
      theme_config: generated.theme,
      status: "ready",
    });
    setSiteId(site.id);
    // 4. salva seÃ§Ãµes
    await sectionsApi.replaceForSite(site.id, generated.sections);
    return { pid, siteId: site.id };
  }

  async function executeGenerateSite() {
    setStatus("generating");
    pushAI("Estou montando seu site... isso leva uns segundos.");
    try {
      const generated = await generateSiteFromBriefing({
        business_name: briefing.nome,
        segment: briefing.segmento,
        city: briefing.cidade,
        main_offer: briefing.oferta,
        target_audience: briefing.publico,
        whatsapp: briefing.whatsapp,
        instagram: briefing.social,
        visual_style: briefing.estilo,
        goal: briefing.objetivo,
        services: briefing.servico ? [briefing.servico] : [],
        notes: `${briefing.diferenciais}\n${briefing.provas}`.trim(),
      });
      await persistEverything(generated);
      setStatus("ready");
      toast.success("Seu site foi salvo nos projetos.");
      pushAI(
        "Sua pÃ¡gina estÃ¡ pronta e salva nos seus projetos! Pode pedir ajustes por aqui.",
        ["Melhorar copy", "Deixar mais premium", "Adicionar depoimentos", "Publicar"],
      );
      if (window.innerWidth < 1024) setTab("preview");
    } catch {
      setStatus("error");
      pushAI("Algo deu errado por aqui. Tenta de novo em alguns segundos.");
    }
  }

  async function generateSite() {
    if (!user) {
      toast.error("FaÃ§a login para gerar seu site.");
      return;
    }
    setStatus("generating");
    pushAI("Salvando briefing e iniciando anÃ¡lise dos squadsâ€¦");
    try {
      let pid = projectId;
      if (!pid) {
        const proj = await projectsApi.create({
          user_id: user.id,
          title: briefing.nome,
          business_name: briefing.nome,
          segment: briefing.segmento,
          objective: briefing.objetivo,
          template_id: null,
          status: "review",
        });
        pid = proj.id;
        setProjectId(pid);
      }
      await briefingsApi.save({
        id: "brf-" + pid,
        project_id: pid,
        business_name: briefing.nome,
        segment: briefing.segmento,
        city: briefing.cidade,
        target_audience: briefing.publico,
        main_offer: briefing.oferta,
        services: briefing.servico ? [briefing.servico] : [],
        whatsapp: briefing.whatsapp,
        instagram: briefing.social,
        visual_style: briefing.estilo,
        goal: briefing.objetivo,
        notes: (briefing.diferenciais + "
" + briefing.provas).trim(),
      });
      void navigate({ to: "/app/prd/$projectId", params: { projectId: pid } });
    } catch {
      setStatus("error");
      pushAI("Algo deu errado ao salvar. Tenta de novo.");
    }
  }

  function handleQuick(label: string) {
    if (label === "Gerar site") return generateSite();
    if (label === "Publicar") return publish();
    if (label === "Revisar respostas") {
      pushAI("Tudo certo, posso seguir? Se quiser mudar algo, Ã© sÃ³ me dizer.");
      return;
    }
    if (label === "Ver planos") {
      pushAI("Acesse a Ã¡rea de CrÃ©ditos para fazer upgrade ou comprar mais crÃ©ditos.");
      return;
    }
    const meta = QUICK_ACTIONS.find((a) => a.label === label);
    if (meta?.action && user) {
      requestCreditAction(meta.action, `${label} â€” ${briefing.nome}`, () => {
        pushMe(label);
        smartReply(label);
      });
      return;
    }
    pushMe(label);
    smartReply(label);
  }

  async function publish() {
    if (status !== "ready" || !siteId) {
      toast.error("Gere o site antes de publicar.");
      return;
    }
    const slug = slugify(briefing.nome) || `site-${Date.now().toString(36)}`;
    await sitesApi.publish(siteId, slug);
    if (projectId) await projectsApi.update(projectId, { status: "published" });
    setPublishedSlug(slug);
    setStatus("published");
    toast.success("Seu link estÃ¡ pronto para compartilhar.");
    pushAI(
      `Seu site estÃ¡ no ar! ðŸŽ‰ Compartilhe: ${window.location.origin}/site/${slug}`,
    );
  }

  function toggleSection(s: string) {
    setActiveSections((a) => (a.includes(s) ? a.filter((x) => x !== s) : [...a, s]));
  }

  const progress = Math.min(100, Math.round((stepIdx / STEPS.length) * 100));

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col gap-3">
      <StatusBar
        status={status}
        progress={progress}
        onPublish={publish}
        balance={user?.credits_balance ?? 0}
        planId={user?.plan_id ?? "start"}
        dailyRemaining={user ? freeDailyRemaining(user.plan_id) : null}
      />


      {/* Mobile tabs */}
      <div className="flex rounded-lg border border-border bg-card p-1 lg:hidden">
        {([
          { k: "chat", label: "Chat", icon: MessageSquare },
          { k: "preview", label: "Preview", icon: Monitor },
          { k: "ajustes", label: "Ajustes", icon: Settings2 },
        ] as const).map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition ${
              tab === t.k ? "bg-brand-gradient text-white" : "text-muted-foreground"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[360px_1fr_320px]">
        {/* Chat */}
        <section className={`min-h-0 ${tab === "chat" ? "" : "hidden"} lg:block`}>
          <ChatPanel
            messages={messages}
            input={input}
            setInput={setInput}
            onSend={() => answer(input)}
            onChip={answer}
            onQuick={handleQuick}
            scrollRef={scrollRef}
            status={status}
            showQuick={stepIdx >= STEPS.length}
          />
        </section>

        {/* Preview */}
        <section className={`min-h-0 ${tab === "preview" ? "" : "hidden"} lg:block`}>
          <PreviewPanel
            briefing={briefing}
            palette={palette}
            font={font}
            device={device}
            setDevice={setDevice}
            sections={activeSections}
            cta={cta}
            status={status}
          />
        </section>

        {/* Settings */}
        <aside className={`min-h-0 ${tab === "ajustes" ? "" : "hidden"} lg:block`}>
          <SettingsPanel
            paletteIdx={paletteIdx} setPaletteIdx={setPaletteIdx}
            fontIdx={fontIdx} setFontIdx={setFontIdx}
            templateIdx={templateIdx} setTemplateIdx={setTemplateIdx}
            sections={activeSections} toggleSection={toggleSection}
            cta={cta} setCta={setCta}
            segmento={briefing.segmento}
            status={status}
            onPublish={publish}
          />
        </aside>
      </div>

      {(status === "ready" || status === "published") && <UpsellBlock />}

      <CreditConfirmDialog
        open={!!pendingEstimate}
        estimate={pendingEstimate}
        balance={user?.credits_balance ?? 0}
        planId={user?.plan_id ?? "start"}
        freeDailyRemaining={user ? freeDailyRemaining(user.plan_id) : null}
        onCancel={() => { setPendingEstimate(null); setPendingExec(null); }}
        onConfirm={() => void confirmPending()}
      />
    </div>
  );
}

function UpsellBlock() {
  const picks = useMemo(
    () =>
      [
        "identidade_visual",
        "video",
        "artes_instagram",
        "trafego",
        "jingle",
        "manutencao",
      ]
        .map((id) => SERVICE_CATALOG.find((s) => s.id === id))
        .filter((x): x is (typeof SERVICE_CATALOG)[number] => Boolean(x)),
    [],
  );
  return (
    <section className="mt-2 rounded-2xl border border-brand/30 bg-gradient-to-br from-brand-soft via-card to-card p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">
            Esteira Publiciart
          </p>
          <h3 className="font-display text-lg font-bold sm:text-xl">
            Quer deixar esse projeto mais profissional?
          </h3>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Nosso time entra em cena pra elevar o nÃ­vel do seu negÃ³cio â€” identidade visual, vÃ­deos, artes e campanhas conectadas ao site que vocÃª acabou de criar.
          </p>
        </div>
        <Link
          to="/app/servicos"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-brand/25"
        >
          Ver todos os serviÃ§os
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {picks.map((s) => (
          <Link
            key={s.id + s.name}
            to="/app/servicos"
            className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-brand/40"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand transition group-hover:bg-brand-gradient group-hover:text-white">
              <s.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{s.name}</p>
              <p className="line-clamp-2 text-[11px] text-muted-foreground">{s.desc}</p>
            </div>
            <span className="ml-1 shrink-0 text-[11px] font-bold text-brand">{s.priceLabel}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}


// ---------------- Status bar ----------------
function StatusBar({
  status, progress, onPublish, balance, planId, dailyRemaining,
}: {
  status: Status;
  progress: number;
  onPublish: () => void;
  balance: number;
  planId: import("@/lib/types").PlanId;
  dailyRemaining: number | null;
}) {
  const info = {
    briefing: { label: "Aguardando briefing", tone: "bg-muted text-foreground", icon: MessageSquare },
    generating: { label: "Gerando seu site...", tone: "bg-brand-soft text-brand", icon: Loader2 },
    ready: { label: "Site gerado", tone: "bg-emerald-500/15 text-emerald-500", icon: Check },
    editing: { label: "Aplicando ajustes...", tone: "bg-brand-soft text-brand", icon: Loader2 },
    error: { label: "Algo deu errado", tone: "bg-red-500/15 text-red-500", icon: AlertCircle },
    "no-credits": { label: "Seu limite de crÃ©ditos foi atingido", tone: "bg-amber-500/15 text-amber-500", icon: AlertCircle },
    published: { label: "Publicado no ar ðŸŽ‰", tone: "bg-emerald-500/15 text-emerald-500", icon: Rocket },
  }[status];
  const Icon = info.icon;
  const dailyBlocked = planId === "start" && dailyRemaining !== null && dailyRemaining <= 0;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${info.tone}`}>
          <Icon className={`h-3.5 w-3.5 ${status === "generating" || status === "editing" ? "animate-spin" : ""}`} />
          {info.label}
        </span>
        <div className="hidden items-center gap-2 sm:flex">
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-brand-gradient transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[11px] text-muted-foreground">Briefing {progress}%</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          to="/app/creditos"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-semibold hover:border-brand hover:text-brand"
          title="Seu saldo de crÃ©ditos"
        >
          <Sparkles className="h-3 w-3 text-brand" />
          {balance} crÃ©ditos
        </Link>
        {planId === "start" && dailyRemaining !== null && (
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${
              dailyBlocked
                ? "bg-red-500/15 text-red-500"
                : dailyRemaining <= 2
                ? "bg-amber-500/15 text-amber-600"
                : "bg-muted text-muted-foreground"
            }`}
            title="Limite diÃ¡rio de aÃ§Ãµes de IA no plano gratuito"
          >
            {dailyBlocked ? "Limite diÃ¡rio atingido" : `${dailyRemaining} aÃ§Ãµes grÃ¡tis hoje`}
          </span>
        )}
        <button
          onClick={onPublish}
          disabled={status !== "ready"}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          <Rocket className="h-3.5 w-3.5" />
          Publicar
        </button>
      </div>
    </div>
  );
}

// ---------------- Chat ----------------
function ChatPanel({
  messages, input, setInput, onSend, onChip, onQuick, scrollRef, status, showQuick,
}: {
  messages: ChatMsg[];
  input: string;
  setInput: (s: string) => void;
  onSend: () => void;
  onChip: (s: string) => void;
  onQuick: (s: string) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  status: Status;
  showQuick: boolean;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">IA Publiciart</p>
          <p className="text-[11px] text-muted-foreground">Sua agÃªncia digital inteligente</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className="space-y-2">
            <Bubble from={m.from} text={m.text} />
            {m.chips && m.chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {m.chips.map((c) => (
                  <button
                    key={c}
                    onClick={() => onChip(c)}
                    className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium hover:border-brand hover:text-brand"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {(status === "generating" || status === "editing") && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {status === "generating" ? "Estamos montando seu site..." : "Aplicando ajustes..."}
          </div>
        )}
      </div>

      {showQuick && (
        <div className="border-t border-border px-3 pt-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AÃ§Ãµes rÃ¡pidas</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                onClick={() => onQuick(a.label)}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium hover:border-brand hover:text-brand"
                title={a.action ? `AÃ§Ã£o com IA â€” consome crÃ©ditos` : "Sem custo"}
              >
                <a.icon className="h-3 w-3" />
                {a.label}
                {a.action && (
                  <span className="ml-0.5 rounded-full bg-brand-soft px-1.5 py-px text-[9px] font-bold text-brand">
                    IA
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            className="flex-1 bg-transparent text-sm outline-none"
            placeholder="Conte para a IA o que vocÃª quer criar..."
          />
          <button onClick={onSend} className="grid h-8 w-8 place-items-center rounded-md bg-brand-gradient text-white">
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Cada geraÃ§Ã£o usa 1 crÃ©dito.</p>
      </div>
    </div>
  );
}

function Bubble({ from, text }: { from: Sender; text: string }) {
  return (
    <div className={`flex ${from === "me" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          from === "me" ? "rounded-br-sm bg-brand-gradient text-white" : "rounded-bl-sm bg-muted text-foreground"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

// ---------------- Preview ----------------
function PreviewPanel({
  briefing, palette, font, device, setDevice, sections, cta, status,
}: {
  briefing: Briefing;
  palette: typeof PALETTES[number];
  font: string;
  device: "desktop" | "mobile";
  setDevice: (d: "desktop" | "mobile") => void;
  sections: string[];
  cta: string;
  status: Status;
}) {
  const nome = briefing.nome || "Seu negÃ³cio";
  const segmento = briefing.segmento || "Segmento";
  const cidade = briefing.cidade || "Sua cidade";
  const servico = briefing.servico || "SoluÃ§Ãµes sob medida";
  const oferta = briefing.oferta || "Atendimento personalizado";
  const isLight = palette.name === "Claro";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-semibold">Preview ao vivo</p>
        <div className="flex gap-1 rounded-md border border-border p-0.5 text-xs">
          <button
            onClick={() => setDevice("desktop")}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 ${device === "desktop" ? "bg-muted font-medium" : "text-muted-foreground"}`}
          >
            <Monitor className="h-3 w-3" /> Desktop
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 ${device === "mobile" ? "bg-muted font-medium" : "text-muted-foreground"}`}
          >
            <Smartphone className="h-3 w-3" /> Mobile
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-auto bg-muted/40 p-4">
        {status === "generating" && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-background/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
              <p className="text-sm font-medium">Estamos montando seu site...</p>
              <p className="text-xs text-muted-foreground">Escrevendo copy, escolhendo seÃ§Ãµes e estilo.</p>
            </div>
          </div>
        )}
        <div
          className={`mx-auto overflow-hidden rounded-xl border border-border shadow-sm transition-all ${
            device === "mobile" ? "max-w-[360px]" : "max-w-3xl"
          }`}
          style={{ background: isLight ? "#ffffff" : palette.bg, color: isLight ? "#0F1115" : "#fff", fontFamily: `${font}, system-ui` }}
        >
          {/* Hero */}
          {sections.includes("Hero") && (
            <div className="p-6" style={{ background: isLight ? "#F7F7F5" : palette.bg }}>
              <p className="text-[10px] uppercase tracking-widest opacity-60">{segmento} Â· {cidade}</p>
              <h2 className="mt-1 text-2xl font-bold leading-tight" style={{ fontFamily: `${font}, system-ui` }}>{nome}</h2>
              <p className="mt-1 text-sm opacity-75">{servico}</p>
              <button
                className="mt-4 rounded-md px-4 py-2 text-xs font-semibold text-white"
                style={{ background: palette.accent }}
              >
                {cta}
              </button>
            </div>
          )}
          {sections.includes("Sobre") && (
            <Section title="Sobre" accent={palette.accent}>
              <p className="text-sm opacity-75">{briefing.publico ? `Atendemos ${briefing.publico}.` : "HÃ¡ anos transformando clientes em fÃ£s."} {briefing.diferenciais}</p>
            </Section>
          )}
          {sections.includes("ServiÃ§os") && (
            <Section title="ServiÃ§os" accent={palette.accent}>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-lg border border-white/10 p-3 text-xs" style={{ background: isLight ? "#fff" : "rgba(255,255,255,0.04)" }}>
                    <p className="font-semibold">ServiÃ§o {i}</p>
                    <p className="opacity-60">DescriÃ§Ã£o curta.</p>
                  </div>
                ))}
              </div>
            </Section>
          )}
          {sections.includes("BenefÃ­cios") && (
            <Section title="BenefÃ­cios" accent={palette.accent}>
              <ul className="space-y-1.5 text-xs opacity-80">
                <li>âœ“ Atendimento rÃ¡pido</li>
                <li>âœ“ Profissionais especializados</li>
                <li>âœ“ AvaliaÃ§Ã£o 5 estrelas</li>
              </ul>
            </Section>
          )}
          {sections.includes("Diferenciais") && (
            <Section title="Diferenciais" accent={palette.accent}>
              <p className="text-xs opacity-75">{briefing.diferenciais || "O que nos torna Ãºnicos no mercado."}</p>
            </Section>
          )}
          {sections.includes("Galeria") && (
            <Section title="Galeria" accent={palette.accent}>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square rounded grid place-items-center text-xs opacity-40" style={{ background: isLight ? "#eee" : "rgba(255,255,255,0.06)" }}>
                    <ImageIcon className="h-4 w-4" />
                  </div>
                ))}
              </div>
            </Section>
          )}
          {sections.includes("Depoimentos") && (
            <Section title="Depoimentos" accent={palette.accent}>
              <div className="rounded-lg p-3 text-xs" style={{ background: isLight ? "#F7F7F5" : "rgba(255,255,255,0.04)" }}>
                <div className="mb-1 flex gap-0.5 text-amber-400">{"â˜…â˜…â˜…â˜…â˜…"}</div>
                <p className="opacity-80">"{briefing.provas || "Atendimento incrÃ­vel, recomendo demais!"}"</p>
                <p className="mt-1 text-[10px] opacity-50">â€” Cliente satisfeito</p>
              </div>
            </Section>
          )}
          {sections.includes("CTA WhatsApp") && (
            <div className="p-5 text-center" style={{ background: palette.accent, color: "#fff" }}>
              <p className="text-sm font-semibold">{oferta}</p>
              <button className="mt-2 inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-semibold" style={{ color: palette.accent }}>
                <Phone className="h-3 w-3" /> {briefing.whatsapp || "Falar no WhatsApp"}
              </button>
            </div>
          )}
          {sections.includes("LocalizaÃ§Ã£o") && (
            <Section title="Onde estamos" accent={palette.accent}>
              <div className="flex items-center gap-2 text-xs opacity-75">
                <MapPin className="h-3.5 w-3.5" /> {cidade}
              </div>
            </Section>
          )}
          {sections.includes("FAQ") && (
            <Section title="Perguntas frequentes" accent={palette.accent}>
              <div className="space-y-1.5 text-xs opacity-75">
                <p className="font-medium">Como funciona o atendimento?</p>
                <p className="opacity-70">RÃ¡pido, prÃ³ximo e sem burocracia.</p>
              </div>
            </Section>
          )}
          {sections.includes("RodapÃ©") && (
            <div className="p-4 text-center text-[10px] opacity-50">Â© {new Date().getFullYear()} {nome} â€” feito com Publiciart Builder</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-white/5 p-5">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
        <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70">{title}</p>
      </div>
      {children}
    </div>
  );
}

// ---------------- Settings ----------------
function SettingsPanel({
  paletteIdx, setPaletteIdx, fontIdx, setFontIdx, templateIdx, setTemplateIdx,
  sections, toggleSection, cta, setCta, segmento, status, onPublish,
}: {
  paletteIdx: number; setPaletteIdx: (n: number) => void;
  fontIdx: number; setFontIdx: (n: number) => void;
  templateIdx: number; setTemplateIdx: (n: number) => void;
  sections: string[]; toggleSection: (s: string) => void;
  cta: string; setCta: (s: string) => void;
  segmento: string;
  status: Status;
  onPublish: () => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-semibold">Ajustes rÃ¡pidos</p>
        <Settings2 className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 space-y-5 overflow-auto p-4">
        <Field icon={Palette} label="Paleta de cores">
          <div className="grid grid-cols-2 gap-2">
            {PALETTES.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setPaletteIdx(i)}
                className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition ${
                  paletteIdx === i ? "border-brand ring-1 ring-brand" : "border-border hover:border-brand/50"
                }`}
              >
                <span className="flex gap-1">
                  <span className="h-5 w-5 rounded" style={{ background: p.bg }} />
                  <span className="h-5 w-5 rounded" style={{ background: p.accent }} />
                </span>
                <span className="font-medium">{p.name}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field icon={Type} label="Fonte">
          <div className="flex flex-wrap gap-1.5">
            {FONTS.map((f, i) => (
              <button
                key={f}
                onClick={() => setFontIdx(i)}
                className={`rounded-md border px-3 py-1.5 text-xs ${
                  fontIdx === i ? "border-brand bg-brand-soft text-brand" : "border-border hover:border-brand/50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </Field>

        <Field icon={Layers} label="Template">
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map((t, i) => (
              <button
                key={t}
                onClick={() => setTemplateIdx(i)}
                className={`rounded-md border px-3 py-1.5 text-xs ${
                  templateIdx === i ? "border-brand bg-brand-soft text-brand" : "border-border hover:border-brand/50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        <Field icon={Sparkles} label="Segmento">
          <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
            {segmento || "Defina no briefing"}
          </div>
        </Field>

        <Field icon={Phone} label="CTA principal">
          <input
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs outline-none focus:border-brand"
          />
        </Field>

        <Field icon={Layers} label="SeÃ§Ãµes ativas">
          <div className="space-y-1">
            {SECTIONS.map((s) => {
              const active = sections.includes(s);
              return (
                <label key={s} className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-muted">
                  <span>{s}</span>
                  <button
                    onClick={() => toggleSection(s)}
                    className={`relative h-4 w-7 rounded-full transition ${active ? "bg-brand" : "bg-muted-foreground/30"}`}
                  >
                    <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${active ? "left-3.5" : "left-0.5"}`} />
                  </button>
                </label>
              );
            })}
          </div>
        </Field>
      </div>

      <div className="border-t border-border p-3">
        <button
          onClick={onPublish}
          disabled={status !== "ready"}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-brand-gradient px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          <Rocket className="h-3.5 w-3.5" />
          {status === "published" ? "Site publicado" : "Publicar site"}
        </button>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, children }: { icon: typeof Palette; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      {children}
    </div>
  );
}

