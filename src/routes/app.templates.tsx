import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Eye,
  Sparkles,
  Crown,
  Star,
  Check,
  X,
  Scissors,
  Heart,
  UtensilsCrossed,
  Calendar,
  Music,
  Briefcase,
  Stethoscope,
  Church,
  ShoppingBag,
  GraduationCap,
  Megaphone,
  Dumbbell,
  Scale,
  Wrench,
  Bike,
  Camera,
  Mic2,
  Shirt,
  Rocket,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/app/templates")({
  head: () => ({ meta: [{ title: "Templates — Publiciart Builder" }] }),
  component: TemplatesPage,
});

// ---------------- Data ----------------
type Badge = "gratis" | "premium" | "recomendado";
type Estilo =
  | "Premium" | "Jovem" | "Minimalista" | "Elegante" | "Popular"
  | "Moderno" | "Criativo" | "Corporativo" | "Evento" | "Conversão";
type Objetivo =
  | "Vender serviço" | "Captar leads" | "Divulgar evento" | "Portfólio"
  | "WhatsApp" | "Vender produto" | "Fortalecer marca" | "Infoproduto";

type Categoria =
  | "Negócios locais" | "Beleza e estética" | "Alimentação" | "Eventos"
  | "Artistas e música" | "Serviços profissionais" | "Saúde e bem-estar"
  | "Igrejas e comunidades" | "Lojas e produtos" | "Infoprodutos" | "Agências e freelancers";

type Template = {
  id: string;
  nome: string;
  segmento: string;
  categoria: Categoria;
  objetivo: Objetivo;
  estilo: Estilo;
  descricao: string;
  secoes: string[];
  badge: Badge;
  icon: LucideIcon;
  colors: [string, string];
};

const TEMPLATES: Template[] = [
  { id: "barbearia-premium", nome: "Barbearia Premium", segmento: "Barbearia", categoria: "Beleza e estética", objetivo: "Vender serviço", estilo: "Premium", descricao: "Visual sofisticado para atrair clientes que valorizam experiência.", secoes: ["Hero", "Serviços", "Galeria", "Depoimentos", "Agendamento", "WhatsApp"], badge: "recomendado", icon: Scissors, colors: ["#0B0B0F", "#D4AF37"] },
  { id: "salao-moderno", nome: "Salão de Beleza Moderno", segmento: "Salão", categoria: "Beleza e estética", objetivo: "Captar leads", estilo: "Moderno", descricao: "Layout fresco e jovem com galeria e antes/depois.", secoes: ["Hero", "Serviços", "Galeria", "Antes/Depois", "Depoimentos", "WhatsApp"], badge: "gratis", icon: Heart, colors: ["#FF6A9A", "#FFC9D8"] },
  { id: "clinica-estetica", nome: "Clínica Estética Elegante", segmento: "Estética", categoria: "Saúde e bem-estar", objetivo: "Captar leads", estilo: "Elegante", descricao: "Confiança e sofisticação para procedimentos premium.", secoes: ["Hero", "Procedimentos", "Equipe", "Resultados", "FAQ", "Agendamento"], badge: "premium", icon: Sparkles, colors: ["#1A1B3A", "#C9A961"] },
  { id: "restaurante-local", nome: "Restaurante Local", segmento: "Restaurante", categoria: "Alimentação", objetivo: "WhatsApp", estilo: "Popular", descricao: "Cardápio destacado, fotos do prato e reserva por WhatsApp.", secoes: ["Hero", "Cardápio", "Galeria", "Localização", "Reservas", "WhatsApp"], badge: "recomendado", icon: UtensilsCrossed, colors: ["#7A1F1F", "#F4B860"] },
  { id: "delivery-rapido", nome: "Delivery Rápido", segmento: "Delivery", categoria: "Alimentação", objetivo: "Vender produto", estilo: "Conversão", descricao: "Pedidos rápidos, combos em destaque e botão flutuante.", secoes: ["Hero", "Combos", "Cardápio", "Promoções", "Pedido", "WhatsApp"], badge: "gratis", icon: Bike, colors: ["#E03C3C", "#FFD93D"] },
  { id: "evento-show", nome: "Evento ou Show", segmento: "Evento", categoria: "Eventos", objetivo: "Divulgar evento", estilo: "Evento", descricao: "Contagem regressiva, atrações e ingressos em destaque.", secoes: ["Hero", "Atrações", "Programação", "Local", "Ingressos", "FAQ"], badge: "recomendado", icon: Calendar, colors: ["#1B0B3A", "#FF3DCD"] },
  { id: "cantor-artista", nome: "Cantor / Artista", segmento: "Artista", categoria: "Artistas e música", objetivo: "Portfólio", estilo: "Criativo", descricao: "Biografia, vídeos, shows e contato para contratação.", secoes: ["Hero", "Bio", "Vídeos", "Shows", "Galeria", "Contato"], badge: "gratis", icon: Mic2, colors: ["#0E0E14", "#FF6A3D"] },
  { id: "produtor-musical", nome: "Produtor Musical", segmento: "Produção", categoria: "Artistas e música", objetivo: "Vender serviço", estilo: "Moderno", descricao: "Portfólio de trabalhos, processos e orçamento.", secoes: ["Hero", "Serviços", "Portfólio", "Processo", "Depoimentos", "Contato"], badge: "premium", icon: Music, colors: ["#0A0A1F", "#7C5CFF"] },
  { id: "loja-roupas", nome: "Loja de Roupas", segmento: "Moda", categoria: "Lojas e produtos", objetivo: "Vender produto", estilo: "Jovem", descricao: "Vitrine de coleções com link para Instagram e WhatsApp.", secoes: ["Hero", "Coleção", "Lançamentos", "Lookbook", "Instagram", "WhatsApp"], badge: "gratis", icon: Shirt, colors: ["#111111", "#F2EFE6"] },
  { id: "personal-trainer", nome: "Personal Trainer", segmento: "Fitness", categoria: "Saúde e bem-estar", objetivo: "Captar leads", estilo: "Moderno", descricao: "Resultados reais, planos e prova social forte.", secoes: ["Hero", "Sobre", "Planos", "Resultados", "Depoimentos", "WhatsApp"], badge: "recomendado", icon: Dumbbell, colors: ["#0F1115", "#FF6A3D"] },
  { id: "advocacia", nome: "Advocacia", segmento: "Jurídico", categoria: "Serviços profissionais", objetivo: "Captar leads", estilo: "Corporativo", descricao: "Áreas de atuação, autoridade e formulário de contato.", secoes: ["Hero", "Áreas", "Equipe", "Cases", "FAQ", "Contato"], badge: "premium", icon: Scale, colors: ["#0E1A2B", "#C9A961"] },
  { id: "oficina-mecanica", nome: "Oficina Mecânica", segmento: "Automotivo", categoria: "Negócios locais", objetivo: "WhatsApp", estilo: "Popular", descricao: "Serviços, preços e orçamento direto no WhatsApp.", secoes: ["Hero", "Serviços", "Orçamento", "Localização", "Galeria", "WhatsApp"], badge: "gratis", icon: Wrench, colors: ["#1A1A1A", "#FFB300"] },
  { id: "agencia-digital", nome: "Agência Digital", segmento: "Agência", categoria: "Agências e freelancers", objetivo: "Vender serviço", estilo: "Premium", descricao: "Cases, processos e planos de serviço para fechar contratos.", secoes: ["Hero", "Serviços", "Cases", "Processo", "Time", "Contato"], badge: "premium", icon: Briefcase, colors: ["#0B0B0F", "#7C5CFF"] },
  { id: "igreja", nome: "Igreja", segmento: "Comunidade", categoria: "Igrejas e comunidades", objetivo: "Fortalecer marca", estilo: "Elegante", descricao: "Cultos, eventos, ministérios e contribuições.", secoes: ["Hero", "Cultos", "Ministérios", "Eventos", "Contribua", "Contato"], badge: "gratis", icon: Church, colors: ["#1A2238", "#E8C547"] },
  { id: "infoproduto", nome: "Infoproduto", segmento: "Educação", categoria: "Infoprodutos", objetivo: "Infoproduto", estilo: "Conversão", descricao: "Curso ou ebook com headline forte e prova social.", secoes: ["Hero", "Para Quem", "Módulos", "Bônus", "Depoimentos", "Checkout"], badge: "recomendado", icon: GraduationCap, colors: ["#0B1020", "#00E5A8"] },
  { id: "pagina-vendas", nome: "Página de Vendas", segmento: "Vendas", categoria: "Infoprodutos", objetivo: "Vender produto", estilo: "Conversão", descricao: "Long page focada 100% em conversão e gatilhos.", secoes: ["Hero", "Problema", "Solução", "Oferta", "Garantia", "FAQ", "Checkout"], badge: "premium", icon: Megaphone, colors: ["#0E0E14", "#FF3D71"] },
  { id: "portfolio", nome: "Portfólio Profissional", segmento: "Portfólio", categoria: "Agências e freelancers", objetivo: "Portfólio", estilo: "Minimalista", descricao: "Mostra seus trabalhos com elegância e clareza.", secoes: ["Hero", "Sobre", "Projetos", "Skills", "Depoimentos", "Contato"], badge: "gratis", icon: Camera, colors: ["#F7F7F5", "#0F1115"] },
  { id: "landing-campanha", nome: "Landing de Campanha", segmento: "Campanha", categoria: "Agências e freelancers", objetivo: "Captar leads", estilo: "Conversão", descricao: "Captura leads para campanha de tráfego pago.", secoes: ["Hero", "Benefícios", "Formulário", "Prova Social", "FAQ"], badge: "recomendado", icon: Rocket, colors: ["#0A0A0F", "#FF6A3D"] },
];

const CATEGORIAS: Categoria[] = [
  "Negócios locais", "Beleza e estética", "Alimentação", "Eventos",
  "Artistas e música", "Serviços profissionais", "Saúde e bem-estar",
  "Igrejas e comunidades", "Lojas e produtos", "Infoprodutos", "Agências e freelancers",
];

const OBJETIVOS: Objetivo[] = [
  "Vender serviço", "Captar leads", "Divulgar evento", "Portfólio",
  "WhatsApp", "Vender produto", "Fortalecer marca", "Infoproduto",
];

const ESTILOS: Estilo[] = [
  "Premium", "Jovem", "Minimalista", "Elegante", "Popular",
  "Moderno", "Criativo", "Corporativo", "Evento", "Conversão",
];

// ---------------- Page ----------------
function TemplatesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState<Categoria | "Todos">("Todos");
  const [objetivo, setObjetivo] = useState<Objetivo | "Todos">("Todos");
  const [estilo, setEstilo] = useState<Estilo | "Todos">("Todos");
  const [preview, setPreview] = useState<Template | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return TEMPLATES.filter((t) => {
      if (q && !`${t.nome} ${t.segmento} ${t.descricao}`.toLowerCase().includes(q)) return false;
      if (categoria !== "Todos" && t.categoria !== categoria) return false;
      if (objetivo !== "Todos" && t.objetivo !== objetivo) return false;
      if (estilo !== "Todos" && t.estilo !== estilo) return false;
      return true;
    });
  }, [search, categoria, objetivo, estilo]);

  function useTemplate(t: Template) {
    navigate({ to: "/app/criador", search: { template: t.id } as never });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="space-y-1">
        <h2 className="font-display text-2xl font-bold">Biblioteca de templates</h2>
        <p className="text-sm text-muted-foreground">
          Escolha um modelo para começar mais rápido. A IA adapta tudo pro seu negócio.
        </p>
      </header>

      {/* Search */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, segmento ou objetivo..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <FilterRow label="Segmento" value={categoria} options={["Todos", ...CATEGORIAS]} onChange={(v) => setCategoria(v as typeof categoria)} />
        <FilterRow label="Objetivo" value={objetivo} options={["Todos", ...OBJETIVOS]} onChange={(v) => setObjetivo(v as typeof objetivo)} />
        <FilterRow label="Estilo" value={estilo} options={["Todos", ...ESTILOS]} onChange={(v) => setEstilo(v as typeof estilo)} />
      </div>

      {/* Results */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          {filtered.length} modelo{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
        </p>
        {(categoria !== "Todos" || objetivo !== "Todos" || estilo !== "Todos" || search) && (
          <button
            onClick={() => { setSearch(""); setCategoria("Todos"); setObjetivo("Todos"); setEstilo("Todos"); }}
            className="text-xs font-medium text-brand hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="font-medium">Nenhum modelo bate com esses filtros.</p>
          <p className="mt-1 text-sm text-muted-foreground">Tente buscar por outro segmento ou estilo.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TemplateCard key={t.id} t={t} onPreview={() => setPreview(t)} onUse={() => useTemplate(t)} />
          ))}
        </div>
      )}

      {preview && <PreviewModal t={preview} onClose={() => setPreview(null)} onUse={() => useTemplate(preview)} />}
    </div>
  );
}

function FilterRow({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
              value === o ? "border-brand bg-brand-soft text-brand" : "border-border bg-background hover:border-brand/50"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function TemplateCard({ t, onPreview, onUse }: { t: Template; onPreview: () => void; onUse: () => void }) {
  const Icon = t.icon;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <button onClick={onPreview} className="relative aspect-[4/3] w-full overflow-hidden text-left">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${t.colors[0]} 0%, ${t.colors[1]} 100%)` }}
        />
        <div className="absolute inset-0 p-4 text-white flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-1 text-[10px] font-medium backdrop-blur">
              <Icon className="h-3 w-3" /> {t.segmento}
            </span>
            <BadgeChip badge={t.badge} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest opacity-70">{t.estilo}</p>
            <p className="font-display text-lg font-bold leading-tight">{t.nome}</p>
          </div>
        </div>
        <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-foreground">
            <Eye className="h-3.5 w-3.5" /> Visualizar
          </span>
        </div>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-muted-foreground line-clamp-2">{t.descricao}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {t.secoes.slice(0, 4).map((s) => (
            <span key={s} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{s}</span>
          ))}
          {t.secoes.length > 4 && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">+{t.secoes.length - 4}</span>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={onPreview}
            className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:border-brand hover:text-brand"
          >
            <Eye className="h-3.5 w-3.5" /> Visualizar
          </button>
          <button
            onClick={onUse}
            className="ml-auto inline-flex items-center gap-1 rounded-md bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-white"
          >
            Usar este modelo
          </button>
        </div>
      </div>
    </article>
  );
}

function BadgeChip({ badge }: { badge: Badge }) {
  const map = {
    gratis: { label: "Grátis", icon: Check, cls: "bg-emerald-500/90" },
    premium: { label: "Premium", icon: Crown, cls: "bg-amber-500/90" },
    recomendado: { label: "Recomendado", icon: Star, cls: "bg-brand" },
  } as const;
  const b = map[badge];
  const Icon = b.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-white ${b.cls}`}>
      <Icon className="h-3 w-3" /> {b.label}
    </span>
  );
}

function PreviewModal({ t, onClose, onUse }: { t: Template; onClose: () => void; onUse: () => void }) {
  const Icon = t.icon;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="grid w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[1.2fr_1fr]"
      >
        <div className="relative aspect-[4/3] md:aspect-auto" style={{ background: `linear-gradient(135deg, ${t.colors[0]} 0%, ${t.colors[1]} 100%)` }}>
          <div className="absolute inset-0 p-6 text-white flex flex-col justify-between">
            <span className="self-start inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-1 text-[10px] font-medium backdrop-blur">
              <Icon className="h-3 w-3" /> {t.segmento}
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-70">{t.estilo}</p>
              <p className="font-display text-2xl font-bold">{t.nome}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col p-5">
          <div className="flex items-center justify-between gap-2">
            <BadgeChip badge={t.badge} />
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
          <h3 className="mt-3 font-display text-lg font-bold">{t.nome}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t.descricao}</p>

          <dl className="mt-4 space-y-2 text-xs">
            <Row label="Categoria" value={t.categoria} />
            <Row label="Objetivo" value={t.objetivo} />
            <Row label="Estilo" value={t.estilo} />
          </dl>

          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Seções inclusas</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {t.secoes.map((s) => (
                <span key={s} className="rounded bg-muted px-2 py-0.5 text-[11px]">{s}</span>
              ))}
            </div>
          </div>

          <button
            onClick={onUse}
            className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-md bg-brand-gradient px-3 py-2 text-sm font-semibold text-white pt-2"
            style={{ marginTop: "1.25rem" }}
          >
            <Sparkles className="h-4 w-4" /> Usar este modelo
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
