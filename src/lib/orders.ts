import {
  Palette,
  Sparkles,
  Image as ImageIcon,
  Video,
  Mic,
  Layers,
  Megaphone,
  Wrench,
  Camera,
  Crown,
  Inbox,
  Search,
  FileText,
  CheckCircle2,
  Factory,
  Eye,
  Truck,
  XCircle,
} from "lucide-react";
import type { ComponentType } from "react";
import type { OrderService, OrderStatus } from "@/lib/types";

export type ServiceDef = {
  id: OrderService;
  icon: ComponentType<{ className?: string }>;
  name: string;
  desc: string;
  audience: string;
  includes: string[];
  price: number;
  priceLabel: string;
  estimatedDays: number;
  badge?: "popular" | "premium";
};

export const SERVICE_CATALOG: ServiceDef[] = [
  {
    id: "logo",
    icon: Palette,
    name: "Criação de logo",
    desc: "Logo profissional, simples e marcante feito pelo nosso time.",
    audience: "Negócios começando ou rebranding rápido.",
    includes: ["2 conceitos iniciais", "1 rodada de ajustes", "Arquivos PNG, SVG e PDF"],
    price: 89,
    priceLabel: "R$ 89",
    estimatedDays: 3,
  },
  {
    id: "identidade_visual",
    icon: Sparkles,
    name: "Identidade visual completa",
    desc: "Marca, paleta, tipografia, papelaria e manual de uso.",
    audience: "Quem quer marca consistente em todos os canais.",
    includes: ["Logo + variações", "Paleta e tipografia", "Manual de marca PDF", "Aplicações principais"],
    price: 249,
    priceLabel: "R$ 249",
    estimatedDays: 7,
    badge: "popular",
  },
  {
    id: "artes_instagram",
    icon: ImageIcon,
    name: "Artes para Instagram",
    desc: "Pacote de artes editáveis prontas para postar.",
    audience: "Quem precisa alimentar o feed sem trava.",
    includes: ["9 artes personalizadas", "Stories combinando", "Versões editáveis no Canva"],
    price: 129,
    priceLabel: "R$ 129",
    estimatedDays: 4,
  },
  {
    id: "video",
    icon: Video,
    name: "Vídeo comercial",
    desc: "Vídeo curto para hero do site ou redes sociais.",
    audience: "Quem quer impacto visual e prova social.",
    includes: ["Roteiro + edição", "Trilha licenciada", "Versão horizontal + vertical"],
    price: 199,
    priceLabel: "R$ 199",
    estimatedDays: 5,
  },
  {
    id: "jingle",
    icon: Mic,
    name: "Música comercial / Jingle",
    desc: "Trilha original com locução pra fixar sua marca.",
    audience: "Lojas, eventos e campanhas sazonais.",
    includes: ["Composição original", "Locução profissional", "Versão 15s e 30s"],
    price: 149,
    priceLabel: "R$ 149",
    estimatedDays: 6,
  },
  {
    id: "pagina_vendas",
    icon: Layers,
    name: "Página de vendas",
    desc: "Landing focada em conversão para uma oferta específica.",
    audience: "Infoprodutos, serviços e lançamentos.",
    includes: ["Copy persuasiva", "Design conversão", "Integração WhatsApp + pixel"],
    price: 349,
    priceLabel: "R$ 349",
    estimatedDays: 7,
    badge: "popular",
  },
  {
    id: "trafego",
    icon: Megaphone,
    name: "Tráfego pago",
    desc: "Gestão de campanhas no Google Ads e Meta Ads.",
    audience: "Quem quer leads e vendas previsíveis.",
    includes: ["Configuração de pixel", "Criativos otimizados", "Relatório semanal", "Otimização contínua"],
    price: 299,
    priceLabel: "R$ 299/mês",
    estimatedDays: 2,
  },
  {
    id: "manutencao",
    icon: Wrench,
    name: "Manutenção mensal",
    desc: "Atualizações, ajustes, novas seções e suporte rápido.",
    audience: "Sites que precisam evoluir com o negócio.",
    includes: ["Até 6 ajustes/mês", "Backup e segurança", "Suporte por WhatsApp"],
    price: 79,
    priceLabel: "R$ 79/mês",
    estimatedDays: 1,
  },
  {
    id: "ensaio_fotos",
    icon: Camera,
    name: "Ensaio fotográfico",
    desc: "Fotos profissionais para site, redes e portfólio.",
    audience: "Negócios locais, profissionais e produtos.",
    includes: ["1 ensaio presencial", "20 fotos tratadas", "Direitos de uso comercial"],
    price: 449,
    priceLabel: "R$ 449",
    estimatedDays: 10,
  },
  {
    id: "pacote_completo",
    icon: Crown,
    name: "Pacote Publiciart Full",
    desc: "Tudo pra colocar seu negócio em outro patamar — site, marca, vídeo, artes e tráfego.",
    audience: "Negócios que querem se posicionar como referência.",
    includes: [
      "Site personalizado",
      "Identidade visual",
      "Vídeo + artes para Instagram",
      "Jingle exclusivo",
      "Campanha de tráfego pago",
      "Manutenção mensal inclusa",
    ],
    price: 1990,
    priceLabel: "Sob consulta",
    estimatedDays: 20,
    badge: "premium",
  },
];

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; tone: string; dot: string; icon: ComponentType<{ className?: string }> }
> = {
  requested:     { label: "Solicitado",      tone: "bg-muted text-foreground",            dot: "bg-muted-foreground", icon: Inbox },
  analyzing:     { label: "Em análise",      tone: "bg-amber-500/15 text-amber-500",      dot: "bg-amber-500",        icon: Search },
  quoted:        { label: "Orçamento enviado", tone: "bg-violet-500/15 text-violet-500",  dot: "bg-violet-500",       icon: FileText },
  approved:      { label: "Aprovado",        tone: "bg-sky-500/15 text-sky-500",          dot: "bg-sky-500",          icon: CheckCircle2 },
  in_production: { label: "Em produção",     tone: "bg-brand/15 text-brand",              dot: "bg-brand",            icon: Factory },
  in_review:     { label: "Em revisão",      tone: "bg-fuchsia-500/15 text-fuchsia-500",  dot: "bg-fuchsia-500",      icon: Eye },
  delivered:     { label: "Entregue",        tone: "bg-emerald-500/15 text-emerald-500",  dot: "bg-emerald-500",      icon: Truck },
  cancelled:     { label: "Cancelado",       tone: "bg-red-500/15 text-red-500",          dot: "bg-red-500",          icon: XCircle },
};

export type KanbanColumn = {
  key: string;
  title: string;
  statuses: OrderStatus[];
};

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { key: "new",        title: "Novo pedido", statuses: ["requested"] },
  { key: "analyzing",  title: "Análise",     statuses: ["analyzing"] },
  { key: "quoted",     title: "Orçamento",   statuses: ["quoted", "approved"] },
  { key: "production", title: "Produção",    statuses: ["in_production"] },
  { key: "review",     title: "Revisão",     statuses: ["in_review"] },
  { key: "delivered",  title: "Entregue",    statuses: ["delivered"] },
];

export function findService(id: OrderService): ServiceDef | undefined {
  return SERVICE_CATALOG.find((s) => s.id === id);
}
