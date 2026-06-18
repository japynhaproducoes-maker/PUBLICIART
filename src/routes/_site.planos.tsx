import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, X, Crown, Star, Sparkles, Zap, Building2, Briefcase, Globe } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";

type Plan = {
  id: "start" | "pro" | "business" | "full";
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  badge?: string;
  icon: typeof Zap;
};

const PLANS: Plan[] = [
  {
    id: "start",
    name: "Start",
    price: "R$ 0",
    period: "/mês",
    desc: "Teste a plataforma e publique em subdomínio publiciart.app.",
    features: [
      "1 projeto ativo",
      "Templates básicos",
      "Briefing guiado com IA",
      "Publicação em subdomínio publiciart.app",
      "Badge \"Criado com Publiciart\"",
      "30 créditos por mês",
    ],
    cta: "Começar grátis",
    icon: Zap,
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 49",
    period: "/mês",
    desc: "Pra quem quer domínio próprio e marca limpa.",
    features: [
      "1 site publicado com domínio próprio",
      "Remover badge Publiciart",
      "Templates premium",
      "Edição conversacional com IA",
      "Botão de WhatsApp + SEO básico",
      "300 créditos por mês",
    ],
    cta: "Assinar Pro",
    highlight: true,
    badge: "Mais escolhido",
    icon: Sparkles,
  },
  {
    id: "business",
    name: "Business",
    price: "R$ 149",
    period: "/mês",
    desc: "Pra agências e empresas que mantêm vários sites.",
    features: [
      "Vários sites publicados",
      "Gestão de clientes e projetos",
      "Domínio próprio em cada site",
      "Biblioteca completa de templates",
      "Duplicação de projetos",
      "Suporte prioritário",
      "1.500 créditos por mês",
    ],
    cta: "Assinar Business",
    icon: Building2,
  },
  {
    id: "full",
    name: "Publiciart Full",
    price: "Sob consulta",
    period: "",
    desc: "Site feito com a equipe + identidade, artes e manutenção.",
    features: [
      "Site personalizado pela equipe",
      "Identidade visual completa",
      "Artes para Instagram",
      "Vídeo comercial",
      "Música ou jingle exclusivo",
      "Campanha de tráfego pago",
      "Atendimento humano + manutenção mensal",
    ],
    cta: "Solicitar orçamento",
    icon: Crown,
  },
];

// Comparação de recursos — valores na mesma ordem dos planos acima
const COMPARE: { label: string; values: (string | boolean)[] }[] = [
  { label: "Projetos ativos", values: ["1", "5", "Ilimitado", "Ilimitado"] },
  { label: "Sites publicados ao mesmo tempo", values: ["1 (subdomínio)", "1 (domínio próprio)", "Vários", "Vários"] },
  { label: "Créditos mensais", values: ["30", "300", "1.500", "Sob medida"] },
  { label: "Templates básicos", values: [true, true, true, true] },
  { label: "Templates premium", values: [false, true, true, true] },
  { label: "Edição por conversa com IA", values: [true, true, true, true] },
  { label: "Botão WhatsApp", values: [false, true, true, true] },
  { label: "Domínio próprio", values: [false, true, true, true] },
  { label: "Remover badge Publiciart", values: [false, true, true, true] },
  { label: "Gestão de clientes", values: [false, false, true, true] },
  { label: "Duplicação de projetos", values: [false, false, true, true] },
  { label: "Suporte prioritário", values: [false, false, true, true] },
  { label: "Atendimento humano", values: [false, false, false, true] },
  { label: "Identidade visual", values: [false, false, false, true] },
  { label: "Vídeo comercial", values: [false, false, false, true] },
  { label: "Manutenção mensal", values: [false, false, false, true] },
];

export const Route = createFileRoute("/_site/planos")({
  head: () => ({ meta: [{ title: "Planos — Publiciart Builder" }] }),
  component: PlansPage,
});

function PlansPage() {
  return (
    <>
      <PageHeader
        eyebrow="Planos"
        title="Crie, publique e mantenha seu site dentro da Publiciart"
        subtitle="Use créditos pra criar e melhorar com IA. Mantenha o site online com uma assinatura ativa. Quanto maior o plano, mais créditos, sites e recursos."
      />
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        {/* Plan cards */}
        <div className="grid gap-5 lg:grid-cols-4">
          {PLANS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  p.highlight
                    ? "border-brand bg-card shadow-2xl shadow-brand/15"
                    : "border-border bg-card"
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-brand-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    <Star className="h-3 w-3" /> {p.badge}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span className={`grid h-8 w-8 place-items-center rounded-lg ${p.highlight ? "bg-brand-gradient text-white" : "bg-brand-soft text-brand"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="font-display text-lg font-bold">{p.name}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground min-h-[3rem]">{p.desc}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-extrabold">{p.price}</span>
                  {p.period && <span className="text-xs text-muted-foreground">{p.period}</span>}
                </div>
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={p.id === "full" ? "/contato" : "/cadastrar"}
                  className={`mt-6 inline-flex justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    p.highlight
                      ? "bg-brand-gradient text-white hover:opacity-90"
                      : "border border-border bg-background hover:border-brand/40 hover:text-brand"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Hosted note */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-brand/20 bg-brand-soft/30 px-5 py-4 text-center text-sm">
          <Globe className="h-4 w-4 text-brand" />
          <span>
            Seu site fica hospedado dentro da Publiciart e permanece online
            enquanto sua assinatura estiver ativa.
          </span>
        </div>

        {/* Comparison table */}
        <div className="mt-14">
          <h2 className="text-center font-display text-2xl font-bold">Compare os planos</h2>
          <p className="mt-1 text-center text-sm text-muted-foreground">Veja exatamente o que entra em cada um.</p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-semibold">Recurso</th>
                  {PLANS.map((p) => (
                    <th key={p.id} className={`px-4 py-3 text-center font-semibold ${p.highlight ? "text-brand" : ""}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row.label} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        {typeof v === "boolean" ? (
                          v ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                        ) : (
                          <span className="text-xs font-medium">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Extra credits */}
        <div className="mt-10 grid gap-4 rounded-2xl border border-border bg-muted/30 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="font-display text-base font-semibold">Precisa de mais créditos no meio do mês?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pacotes extras a partir de <strong className="text-foreground">R$ 19</strong>. Use para gerar mais sites, regerar seções, melhorar copy e criar variações.
            </p>
          </div>
          <Link to="/cadastrar" className="inline-flex items-center justify-center rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white">
            <Briefcase className="mr-1.5 h-4 w-4" /> Começar agora
          </Link>
        </div>
      </section>
    </>
  );
}
