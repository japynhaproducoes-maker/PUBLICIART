import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  MessageSquare,
  Rocket,
  Wand2,
  Palette,
  Megaphone,
  ShieldCheck,
  ArrowRight,
  Check,
  Scissors,
  Heart,
  UtensilsCrossed,
  CalendarDays,
  Music2,
  Store,
  Church,
  Dumbbell,
  Scale,
  Wrench,
  Bike,
  GraduationCap,
  Star,
  Quote,
  Plus,
  Minus,
  MessageCircle,
  Briefcase,
  Globe2,
  Zap,
  ClipboardList,
  Target,
  Users,
  Lightbulb,
  Hammer,
  Brain,
  Search,
  Ban,
  Hand,
  TrendingUp,
  FileCheck,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "Publiciart Builder — Crie sites com IA estratégica para negócios reais" },
      {
        name: "description",
        content:
          "A Publiciart Builder analisa sua ideia com uma esteira de especialistas em marca, oferta, copy, design e conversão antes de gerar seu site. Crie com estratégia, não só com prompt.",
      },
      { property: "og:title", content: "Publiciart Builder — Sites com IA estratégica" },
      {
        property: "og:description",
        content:
          "Análise estratégica antes da construção. A primeira plataforma que pensa antes de gerar seu site.",
      },
    ],
  }),
  component: LandingPage,
});

/* ---------- Data ---------- */

const strategicBenefits = [
  { icon: Brain, title: "Não cria no automático sem pensar", desc: "Cada site passa por análise antes de ser gerado. Nada de resultado genérico." },
  { icon: Search, title: "Analisa antes de construir", desc: "A plataforma organiza sua ideia em briefing estratégico, BRD e direção de página." },
  { icon: Lightbulb, title: "Recomenda melhorias com explicação simples", desc: "Você recebe sugestões claras sobre marca, oferta, copy, design e conversão." },
  { icon: ShieldCheck, title: "Evita decisões fracas de design e copy", desc: "A esteira revisa cada elemento antes da construção, economizando retrabalho." },
  { icon: Hand, title: "Mantém o cliente no controle", desc: "A plataforma recomenda o melhor caminho, mas a decisão final é sempre sua." },
  { icon: TrendingUp, title: "Gera sites mais estratégicos", desc: "O resultado é uma página pensada para vender, divulgar e crescer — não só para existir." },
];

const segments = [
  { name: "Barbearia", icon: Scissors },
  { name: "Estética", icon: Heart },
  { name: "Restaurante", icon: UtensilsCrossed },
  { name: "Evento", icon: CalendarDays },
  { name: "Artista", icon: Music2 },
  { name: "Loja local", icon: Store },
  { name: "Igreja", icon: Church },
  { name: "Personal", icon: Dumbbell },
  { name: "Advocacia", icon: Scale },
  { name: "Oficina", icon: Wrench },
  { name: "Delivery", icon: Bike },
  { name: "Infoproduto", icon: GraduationCap },
];

const pipeline = [
  { label: "Briefing", icon: MessageSquare },
  { label: "IA monta", icon: Sparkles },
  { label: "Seu site", icon: Globe2 },
  { label: "Ajustes", icon: Wand2 },
  { label: "Publicação", icon: Rocket },
  { label: "Extras", icon: Megaphone },
];

const testimonials = [
  {
    name: "Rafael Lima",
    role: "Barbearia Studio RL — Belo Horizonte",
    text: "Em 15 minutos meu site tava no ar com agendamento no WhatsApp. Já fechei 9 cortes na primeira semana.",
  },
  {
    name: "Camila Souza",
    role: "Produtora — Festa Sertaneja BH",
    text: "Eu precisava de uma página pro evento pra ontem. Respondi o briefing e saiu uma página linda, vendendo ingresso.",
  },
  {
    name: "Dra. Júlia Mendes",
    role: "Clínica Estética Júlia Mendes",
    text: "Os textos vieram prontos e bem escritos. Parece que uma agência fez. E eu mesma editei tudo conversando.",
  },
  {
    name: "MC Bruno",
    role: "Artista — São Paulo",
    text: "Eu não entendo nada de site. Aqui eu só conversei. Saiu meu portfólio com vídeos, shows e contato direto.",
  },
];

const plans = [
  {
    name: "Start",
    price: "R$ 0",
    period: "/mês",
    desc: "Pra começar e testar.",
    features: ["1 site publicado", "Subdomínio grátis", "Edição por chat", "Suporte por e-mail"],
    cta: "Começar grátis",
  },
  {
    name: "Pro",
    price: "R$ 49",
    period: "/mês",
    desc: "Pro pequeno negócio.",
    features: ["3 sites publicados", "Domínio próprio", "Templates premium", "WhatsApp integrado"],
    cta: "Assinar Pro",
    highlight: true,
    badge: "Mais escolhido",
  },
  {
    name: "Business",
    price: "R$ 129",
    period: "/mês",
    desc: "Pra crescer de verdade.",
    features: ["10 sites publicados", "SEO avançado", "Equipe e clientes", "Suporte prioritário"],
    cta: "Assinar Business",
  },
  {
    name: "Publiciart Full",
    price: "R$ 349",
    period: "/mês",
    desc: "Agência inteira na sua mão.",
    features: ["Sites ilimitados", "Logo, vídeo, jingle", "Tráfego pago incluso", "Gerente dedicado"],
    cta: "Falar com vendas",
  },
];

const faqs = [
  {
    q: "Preciso saber programar?",
    a: "Não. Você só conversa com a IA. Sem código, sem complicação — se sabe escrever no WhatsApp, sabe usar o Publiciart.",
  },
  {
    q: "Posso usar meu WhatsApp no site?",
    a: "Sim. Todo site já vem com botão de WhatsApp flutuante e CTAs que levam o cliente direto pra sua conversa.",
  },
  {
    q: "Posso pedir ajustes depois?",
    a: "À vontade. Você edita por chat: muda cor, texto, foto, seção — e o preview atualiza na hora.",
  },
  {
    q: "Posso contratar a equipe pra finalizar pra mim?",
    a: "Pode. A gente oferece serviços extras de logo, identidade visual, vídeo, jingle, tráfego pago e finalização profissional.",
  },
  {
    q: "O site fica responsivo?",
    a: "Sempre. Todos os templates são otimizados pra celular, tablet e desktop por padrão.",
  },
  {
    q: "Posso publicar com domínio próprio?",
    a: "Sim. Nos planos Pro em diante você conecta seu domínio em poucos cliques, com SSL incluído.",
  },
];

const squadSteps = [
  {
    icon: ClipboardList,
    title: "Briefing inteligente",
    desc: "Você conta sua ideia, objetivo, público e preferências. A plataforma organiza tudo em um briefing estruturado.",
  },
  {
    icon: Target,
    title: "Análise estratégica",
    desc: "Nossa IA transforma sua ideia em um briefing, BRD e direção de página — antes de qualquer linha de código.",
  },
  {
    icon: Users,
    title: "Revisão por squads",
    desc: "A esteira avalia marca, oferta, copy, design, UX, conversão e presença digital — como uma agência faria.",
  },
  {
    icon: FileCheck,
    title: "Recomendação clara",
    desc: "Você recebe sugestões simples para melhorar o resultado, com explicação de por que cada mudança importa.",
  },
  {
    icon: Hammer,
    title: "Construção do site",
    desc: "Depois da aprovação, a plataforma gera o site com base na melhor estratégia definida para o seu negócio.",
  },
];

/* ---------- Page ---------- */

function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <SquadSteps />
      <StrategicBenefits />
      <YouDecide />
      <Templates />
      <Pipeline />
      <Social />
      <Plans />
      <FAQ />
      <FinalCTA />
    </>
  );
}

/* ---------- Sections ---------- */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_0%,oklch(0.66_0.22_255/0.18)_0%,transparent_70%),radial-gradient(40%_30%_at_85%_10%,oklch(0.72_0.2_45/0.14)_0%,transparent_70%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            IA estratégica brasileira
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl md:text-6xl">
            Crie sites com IA estratégica,
            <span className="text-brand-gradient"> não só com prompt</span>.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            A Publiciart Builder analisa sua ideia com uma esteira de especialistas em marca, oferta, copy, design e
            conversão — antes de gerar seu site.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/cadastrar"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition hover:opacity-90"
            >
              Começar análise grátis <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-muted"
            >
              Ver como funciona
            </a>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Sem cartão de crédito. Análise estratégica grátis.
          </p>
        </div>

        <BuilderMockup />
      </div>
    </section>
  );
}

function BuilderMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-brand-gradient opacity-20 blur-3xl" />
      <div className="rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-brand/10">
        <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent-warm/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          <span className="ml-2 text-[11px] text-muted-foreground">publiciart.app/criador</span>
        </div>
        <div className="grid gap-3 p-3 sm:grid-cols-[1fr_1.1fr_0.8fr]">
          {/* Chat */}
          <div className="space-y-2 rounded-xl bg-muted/50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Chat com IA</p>
            <ChatBubble side="me" text="Site pra minha barbearia, com agendamento." />
            <ChatBubble side="ai" text="Boa! Vou montar home, serviços e equipe. Cor preferida?" />
            <ChatBubble side="me" text="Preto e laranja." />
            <div className="rounded-lg border border-dashed border-border p-2 text-[11px] text-muted-foreground">
              Gerando seu site...
            </div>
          </div>

          {/* Preview */}
          <div className="overflow-hidden rounded-xl border border-border">
            <p className="border-b border-border bg-background/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Preview ao vivo
            </p>
            <div className="bg-[oklch(0.18_0.03_280)] p-3 text-white">
              <p className="text-[10px] uppercase tracking-widest text-white/60">Barbearia</p>
              <p className="font-display text-lg font-bold">Studio do João</p>
            </div>
            <div className="space-y-2 p-3">
              <div className="h-2 w-3/4 rounded bg-muted" />
              <div className="h-2 w-full rounded bg-muted" />
              <div className="h-2 w-2/3 rounded bg-muted" />
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                <div className="aspect-square rounded bg-brand-soft" />
                <div className="aspect-square rounded bg-accent" />
                <div className="aspect-square rounded bg-muted" />
              </div>
              <div className="mt-2 rounded-md bg-brand-gradient px-2 py-1.5 text-center text-[11px] font-semibold text-white">
                Agendar no WhatsApp
              </div>
            </div>
          </div>

          {/* Painel de ajustes */}
          <div className="space-y-2 rounded-xl bg-muted/50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Ajustes</p>
            <PanelRow label="Cor primária" swatch="bg-brand-gradient" />
            <PanelRow label="Tom da copy" value="Comercial" />
            <PanelRow label="WhatsApp" value="Ativo" dot="bg-success" />
            <PanelRow label="Domínio" value="Subdomínio" />
            <div className="mt-1 rounded-md bg-brand-gradient px-2 py-1.5 text-center text-[11px] font-semibold text-white">
              Publicar agora
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelRow({ label, value, swatch, dot }: { label: string; value?: string; swatch?: string; dot?: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-background/70 px-2 py-1.5 text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      {swatch ? (
        <span className={`h-3 w-6 rounded ${swatch}`} />
      ) : (
        <span className="flex items-center gap-1 font-medium">
          {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
          {value}
        </span>
      )}
    </div>
  );
}

function ChatBubble({ side, text }: { side: "me" | "ai"; text: string }) {
  return (
    <div className={`flex ${side === "me" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[90%] rounded-2xl px-3 py-2 text-[11px] leading-snug ${
          side === "me"
            ? "rounded-br-sm bg-brand-gradient text-white"
            : "rounded-bl-sm bg-background text-foreground"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Responda o briefing", d: "A IA faz perguntas simples sobre seu negócio. Você só responde no chat." },
    { n: "02", t: "A IA monta seu site", d: "Em segundos, sai uma página completa com textos, imagens e estrutura comercial." },
    { n: "03", t: "Edite e publique", d: "Ajuste tudo conversando e publique com 1 clique, no seu domínio ou no nosso." },
  ];
  return (
    <section id="como-funciona" className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand">Como funciona</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Do briefing ao site no ar em 3 passos</h2>
          <p className="mt-3 text-muted-foreground">Sem reunião, sem orçamento, sem espera. Você no controle.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-7">
              <span className="font-display text-3xl font-extrabold text-brand-gradient">{s.n}</span>
              <h3 className="mt-3 font-display text-lg font-semibold">{s.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SquadSteps() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand">Como nossa esteira trabalha por trás</span>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Uma agência inteira analisa antes de construir
        </h2>
        <p className="mt-3 text-muted-foreground">
          Não basta gerar um site. A Publiciart Builder passa sua ideia por uma esteira de especialistas antes de qualquer linha de código.
        </p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {squadSteps.map((s, i) => (
          <div
            key={s.title}
            className="group relative rounded-2xl border border-border bg-card p-6 transition hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5"
          >
            <div className="absolute -top-3 left-5 rounded-full bg-brand-gradient px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="mt-2 grid h-10 w-10 place-items-center rounded-lg bg-brand-soft text-brand transition group-hover:bg-brand-gradient group-hover:text-white">
              <s.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-base font-semibold">{s.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StrategicBenefits() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand">Por que somos diferentes</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Sites mais estratégicos, menos genéricos
          </h2>
          <p className="mt-3 text-muted-foreground">
            A maioria dos builders gera no automático. A Publiciart Builder pensa antes de criar.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {strategicBenefits.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 transition hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-soft text-brand transition group-hover:bg-brand-gradient group-hover:text-white">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function YouDecide() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 sm:p-14">
        <div
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            background: "radial-gradient(60% 50% at 20% 0%, oklch(0.66 0.22 255 / 0.12), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand">Você sempre decide</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            A decisão final é sempre sua
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            A Publiciart Builder recomenda o melhor caminho, mas a decisão final é sua. Se sua preferência faz parte da
            identidade do seu negócio, a plataforma segue sua escolha e adapta o restante da página para manter um
            resultado profissional.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5">
              <Hand className="h-3.5 w-3.5 text-brand" />
              Você no controle
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              IA que adapta
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" />
              Resultado profissional
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Templates() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand">Templates por segmento</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Comece de um modelo feito pro seu negócio</h2>
          <p className="mt-3 text-muted-foreground">Doze segmentos cobertos. E a IA adapta tudo pro seu jeito.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {segments.map((s, i) => (
            <div
              key={s.name}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10"
            >
              <div
                className="absolute inset-0 -z-10 opacity-50 transition group-hover:opacity-80"
                style={{
                  background: `radial-gradient(80% 60% at ${i % 2 ? "20%" : "80%"} 0%, oklch(0.66 0.22 255 / 0.15), transparent 60%)`,
                }}
              />
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display font-semibold">{s.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">Modelo pronto + IA</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
          >
            Ver todos os modelos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Pipeline() {
  return (
    <section className="bg-[oklch(0.16_0.03_280)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-gradient">A esteira Publiciart</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Da ideia ao crescimento, num fluxo só</h2>
          <p className="mt-3 text-white/70">Você acompanha cada etapa em tempo real, no seu painel.</p>
        </div>
        <div className="mt-12 flex flex-wrap items-stretch justify-center gap-3 sm:gap-2">
          {pipeline.map((p, i) => (
            <div key={p.label} className="flex items-center gap-2 sm:gap-3">
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 sm:px-5 sm:py-5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient">
                  <p.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-semibold">{p.label}</span>
              </div>
              {i < pipeline.length - 1 && (
                <ArrowRight className="h-4 w-4 shrink-0 text-white/40" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-white/60">
          <Zap className="h-3.5 w-3.5 text-brand" />
          Tudo isso roda em segundos. De verdade.
        </div>
      </div>
    </section>
  );
}

function Social() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand">Quem já usa</span>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Pequenos negócios crescendo todo dia</h2>
        <p className="mt-3 text-muted-foreground">Histórias reais de quem deixou de adiar a presença digital.</p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((t) => (
          <figure key={t.name} className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
            <Quote className="h-5 w-5 text-brand" />
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90">
              "{t.text}"
            </blockquote>
            <div className="mt-5 flex items-center gap-1 text-accent-warm">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <figcaption className="mt-3">
              <p className="font-display text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Plans() {
  return (
    <section id="planos" className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand">Planos</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Comece grátis. Cresce com você.</h2>
          <p className="mt-3 text-muted-foreground">Sem fidelidade. Mude ou cancele quando quiser.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-2xl border p-6 transition ${
                p.highlight
                  ? "border-brand/50 bg-card shadow-2xl shadow-brand/15"
                  : "border-border bg-card hover:border-white/20"
              }`}
            >
              {p.badge && (
                <span className="absolute -top-3 left-6 rounded-full bg-brand-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow">
                  {p.badge}
                </span>
              )}
              <h3 className="font-display text-lg font-bold">{p.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-3xl font-extrabold tracking-tight">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
              <ul className="mt-5 flex-1 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/cadastrar"
                className={`mt-6 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  p.highlight
                    ? "bg-brand-gradient text-white shadow-lg shadow-brand/25 hover:opacity-95"
                    : "border border-border bg-background hover:bg-muted"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Todos os planos incluem hospedagem, SSL e suporte em português.
        </p>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand">Dúvidas frequentes</span>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">A gente já respondeu</h2>
      </div>
      <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-muted/40"
              >
                <span className="font-display text-sm font-semibold sm:text-base">{f.q}</span>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-brand-gradient p-10 text-center text-white shadow-2xl sm:p-14">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_50%_0%,oklch(1_0_0/0.18),transparent_70%)]" />
        <ShieldCheck className="mx-auto h-8 w-8 opacity-80" />
        <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
          Seu negócio pode ter uma presença digital profissional ainda hoje.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/80">
          Sem reunião, sem orçamento, sem espera. Comece agora com uma análise estratégica grátis.
        </p>
        <Link
          to="/cadastrar"
          className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand shadow hover:bg-white/90"
        >
          Começar análise grátis <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-3 text-xs text-white/70">Grátis pra começar. Sem cartão.</p>
      </div>
    </section>
  );
}
