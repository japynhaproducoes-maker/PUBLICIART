/**
 * Camada de geração de site.
 *
 * Hoje: gera estrutura mockada a partir do briefing.
 * Amanhã: substituir por chamada real à IA via backend próprio
 * mantendo a MESMA assinatura de entrada/saída — a UI não muda.
 *
 *   const result = await generateSiteFromBriefing(briefing);
 *
 * Para conectar IA real, troque o corpo de `generateSiteFromBriefing` por
 * uma chamada a um endpoint (createServerFn) que invoca o modelo e retorna
 * o mesmo formato `GeneratedSiteResult`.
 */

import type { GeneratedSection, SectionType, ThemeConfig } from "./types";

export interface BriefingInput {
  business_name: string;
  segment: string;
  city?: string;
  main_offer?: string;
  target_audience?: string;
  whatsapp?: string;
  instagram?: string;
  visual_style?: string;
  goal?: string;
  services?: string[];
  notes?: string;
}

export interface GeneratedSiteResult {
  slug: string;
  title: string;
  theme: ThemeConfig;
  sections: Omit<GeneratedSection, "id" | "site_id">[];
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

const PALETTE_BY_STYLE: Record<string, ThemeConfig> = {
  premium: { primary: "#D4AF37", accent: "#D4AF37", font: "Playfair", mode: "dark" },
  escuro: { primary: "#FF6A3D", accent: "#FF6A3D", font: "Sora", mode: "dark" },
  claro: { primary: "#FF6A3D", accent: "#FF6A3D", font: "Inter", mode: "light" },
  minimalista: { primary: "#0F1115", accent: "#0F1115", font: "Manrope", mode: "light" },
  vibrante: { primary: "#7C5CFF", accent: "#FF6A3D", font: "Sora", mode: "dark" },
};

function pickTheme(style?: string): ThemeConfig {
  if (!style) return PALETTE_BY_STYLE.escuro;
  const key = style.toLowerCase();
  for (const k of Object.keys(PALETTE_BY_STYLE)) {
    if (key.includes(k)) return PALETTE_BY_STYLE[k];
  }
  return PALETTE_BY_STYLE.escuro;
}

const DEFAULT_SECTIONS: SectionType[] = [
  "hero",
  "about",
  "services",
  "testimonials",
  "faq",
  "cta",
  "contact",
];

export async function generateSiteFromBriefing(
  briefing: BriefingInput,
): Promise<GeneratedSiteResult> {
  // Simula latência de IA — substitua por chamada real ao backend
  await new Promise((r) => setTimeout(r, 700));

  const nome = briefing.business_name || "Seu Negócio";
  const segmento = briefing.segment || "Negócio local";
  const cidade = briefing.city || "sua cidade";
  const oferta = briefing.main_offer || "Atendimento personalizado";
  const publico = briefing.target_audience || "nossos clientes";
  const slug = slugify(nome) || `site-${Date.now().toString(36)}`;

  const sections: GeneratedSiteResult["sections"] = DEFAULT_SECTIONS.map((type, i) => {
    switch (type) {
      case "hero":
        return {
          type,
          order_index: i,
          title: nome,
          content: `${segmento} em ${cidade}. ${oferta}.`,
          config: { cta: "Falar no WhatsApp", subtitle: oferta },
        };
      case "about":
        return {
          type,
          order_index: i,
          title: `Sobre ${nome}`,
          content: `Atendemos ${publico} com dedicação e qualidade. ${briefing.notes ?? ""}`.trim(),
          config: {},
        };
      case "services":
        return {
          type,
          order_index: i,
          title: "Nossos serviços",
          content: (briefing.services && briefing.services.length > 0
            ? briefing.services
            : ["Atendimento personalizado", "Qualidade comprovada", "Entrega rápida", "Suporte humano"]
          ).join(" · "),
          config: {
            items: briefing.services?.length
              ? briefing.services
              : ["Serviço principal", "Atendimento", "Consultoria", "Pós-venda"],
          },
        };
      case "testimonials":
        return {
          type,
          order_index: i,
          title: "O que dizem sobre nós",
          content: "Atendimento incrível, super recomendo!",
          config: {
            items: [
              { name: "Cliente satisfeito", text: "Atendimento incrível, super recomendo!", stars: 5 },
              { name: "Cliente fiel", text: "Profissionalismo do começo ao fim.", stars: 5 },
            ],
          },
        };
      case "faq":
        return {
          type,
          order_index: i,
          title: "Perguntas frequentes",
          content: "",
          config: {
            items: [
              { q: "Como funciona o atendimento?", a: "Rápido, próximo e sem burocracia." },
              { q: "Qual a forma de pagamento?", a: "Aceitamos PIX, cartão e dinheiro." },
              { q: "Vocês atendem na minha região?", a: `Atendemos em ${cidade} e região.` },
            ],
          },
        };
      case "cta":
        return {
          type,
          order_index: i,
          title: oferta,
          content: `Fale com ${nome} agora mesmo pelo WhatsApp.`,
          config: { whatsapp: briefing.whatsapp ?? "" },
        };
      case "contact":
        return {
          type,
          order_index: i,
          title: "Contato",
          content: `${cidade} · ${briefing.whatsapp ?? "WhatsApp"} · ${briefing.instagram ?? ""}`.trim(),
          config: {
            whatsapp: briefing.whatsapp ?? "",
            instagram: briefing.instagram ?? "",
            city: cidade,
          },
        };
      default:
        return { type, order_index: i, title: "", content: "", config: {} };
    }
  });

  return {
    slug,
    title: nome,
    theme: pickTheme(briefing.visual_style),
    sections,
  };
}
