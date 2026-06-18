import type { SquadPRD } from "@/lib/prd";

export function generateMockPRD(_projectId: string): SquadPRD {
  return {
    brand: {
      positioning: "Referência local em qualidade e resultado para quem busca excelência sem complicação.",
      value_proposition: "Entregamos resultado real com atendimento personalizado — porque cada cliente é único.",
      brand_personality: ["Confiável", "Especialista", "Próximo"],
      tone_of_voice: "Direto e acolhedor — fala como quem entende do assunto, sem jargão.",
      key_differentiators: ["Atendimento 100% personalizado", "Profissional experiente no segmento", "Resultado documentado"],
      archetype: "Especialista",
    },
    copy: {
      hero_headline: "Resultado que você vê. Experiência que você sente.",
      hero_subheadline: "Atendemos você com atenção e técnica de ponta — porque você merece o melhor.",
      primary_cta: "Falar no WhatsApp",
      about_paragraph: "Nascemos com um propósito claro: entregar excelência em cada atendimento. Nossa equipe combina técnica e cuidado para que cada cliente saia satisfeito — e volte.",
      pain_points: ["Cansado de profissionais que prometem e não entregam", "Dificuldade em encontrar alguém de confiança", "Resultados inconsistentes"],
      desires: ["Resultado rápido e duradouro", "Ser atendido por quem realmente entende", "Pagar por algo que vale cada centavo"],
      social_proof_angle: "Clientes satisfeitos que indicam para amigos e sempre voltam.",
    },
    audience: {
      primary_persona: "Adulto de 25–45 anos que valoriza qualidade, já teve experiências ruins e agora busca alguém de confiança.",
      age_range: "25–45 anos",
      main_fears: ["Gastar dinheiro sem resultado", "Ser mal atendido", "Precisar refazer o serviço"],
      main_desires: ["Resolver de vez e sem estresse", "Sentir que foi bem tratado", "Ter custo-benefício real"],
      buying_trigger: "Indicação de alguém de confiança ou depoimento convincente",
      objections: ["Preço parece alto comparado a outros", "Não conheço o profissional ainda"],
    },
    design: {
      recommended_style: "Moderno e limpo com acentos de cor vibrante — profissionalismo sem ser frio.",
      color_rationale: "Paleta escura com acento energético comunica autoridade e dinamismo.",
      sections_recommended: ["hero", "about", "services", "testimonials", "faq", "cta", "contact"],
      sections_order: ["hero", "about", "services", "testimonials", "faq", "cta", "contact"],
      visual_references: ["Design bold com tipografia grande e impactante", "Imagens reais com overlay da cor da marca"],
    },
  };
}
