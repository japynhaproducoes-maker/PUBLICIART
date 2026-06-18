/**
 * Gerador de site.
 *
 * Hoje: implementação mock determinística (sem chamada externa).
 * Amanhã: trocar `generateSite` por uma chamada ao provedor configurado em
 * `config.ai` (OpenAI, Gemini, endpoint próprio) — manter o mesmo retorno.
 */

import type { SectionType } from "@prisma/client";
import { slugify } from "../utils/slug.js";

export interface BriefingInput {
  business_name: string;
  segment: string;
  city?: string;
  main_offer?: string;
  target_audience?: string;
  whatsapp?: string;
  visual_style?: string;
  goal?: string;
  services?: string[];
}

export interface GeneratedSection {
  type: SectionType;
  title: string;
  content: string;
  order_index: number;
  config: Record<string, unknown>;
}

export interface GeneratedSiteResult {
  title: string;
  slug: string;
  theme: { primary: string; accent: string; font: string; mode: "light" | "dark" };
  sections: GeneratedSection[];
}

export async function generateSite(b: BriefingInput): Promise<GeneratedSiteResult> {
  // TODO: integrar com config.ai.provider quando !== "mock"
  const sections: GeneratedSection[] = [
    { type: "hero", title: b.business_name, content: b.main_offer ?? `Bem-vindo à ${b.business_name}`, order_index: 0, config: {} },
    { type: "about", title: "Sobre", content: `Atendemos ${b.target_audience ?? "nossos clientes"} em ${b.city ?? "sua região"}.`, order_index: 1, config: {} },
    { type: "services", title: "Serviços", content: (b.services ?? []).join(", "), order_index: 2, config: {} },
    { type: "cta", title: "Fale agora no WhatsApp", content: b.whatsapp ?? "", order_index: 3, config: {} },
    { type: "contact", title: "Contato", content: b.whatsapp ?? "", order_index: 4, config: {} },
  ];
  return {
    title: b.business_name,
    slug: slugify(b.business_name) || `site-${Date.now()}`,
    theme: { primary: "#FF6A3D", accent: "#FF6A3D", font: "Sora", mode: "dark" },
    sections,
  };
}
