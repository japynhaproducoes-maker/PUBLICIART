/**
 * Squad Analyzer — Publiciart Builder
 *
 * 4 squads em paralelo via OpenRouter (Gemma 4 31B — free tier).
 * Quando AI_PROVIDER=mock, retorna dados determinísticos.
 */

import { config } from "../config.js";

export interface BriefingInput {
  business_name: string;
  segment: string;
  city?: string;
  main_offer?: string;
  target_audience?: string;
  visual_style?: string;
  goal?: string;
  services?: string[];
  notes?: string;
  instagram?: string;
  whatsapp?: string;
}

export interface BrandAnalysis {
  positioning: string;
  value_proposition: string;
  brand_personality: string[];
  tone_of_voice: string;
  key_differentiators: string[];
  archetype: string;
}

export interface CopyAnalysis {
  hero_headline: string;
  hero_subheadline: string;
  primary_cta: string;
  about_paragraph: string;
  pain_points: string[];
  desires: string[];
  social_proof_angle: string;
}

export interface AudienceAnalysis {
  primary_persona: string;
  age_range: string;
  main_fears: string[];
  main_desires: string[];
  buying_trigger: string;
  objections: string[];
}

export interface DesignAnalysis {
  recommended_style: string;
  color_rationale: string;
  sections_recommended: string[];
  sections_order: string[];
  visual_references: string[];
}

export interface SquadAnalysisResult {
  brand: BrandAnalysis;
  copy: CopyAnalysis;
  audience: AudienceAnalysis;
  design: DesignAnalysis;
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

function brandPrompt(b: BriefingInput): string {
  return `Você é um estrategista de marca sênior. Analise o briefing e retorne SOMENTE JSON válido, sem markdown:
{"positioning":"frase de posicionamento diferenciada","value_proposition":"proposta de valor em 1 frase","brand_personality":["traço1","traço2","traço3"],"tone_of_voice":"descrição do tom de voz","key_differentiators":["dif1","dif2","dif3"],"archetype":"arquétipo (ex: Herói, Sábio, Criador)"}

BRIEFING: Negócio: ${b.business_name} | Segmento: ${b.segment} | Cidade: ${b.city ?? "não informada"} | Oferta: ${b.main_offer ?? "não informada"} | Público: ${b.target_audience ?? "não informado"} | Objetivo: ${b.goal ?? "não informado"} | Notas: ${b.notes ?? "nenhuma"}`;
}

function copyPrompt(b: BriefingInput): string {
  return `Você é um copywriter especialista no mercado brasileiro. Retorne SOMENTE JSON válido, sem markdown:
{"hero_headline":"headline principal impactante","hero_subheadline":"subtítulo complementar","primary_cta":"texto do botão CTA","about_paragraph":"parágrafo sobre o negócio em 2 linhas","pain_points":["dor1","dor2","dor3"],"desires":["desejo1","desejo2","desejo3"],"social_proof_angle":"ângulo de prova social"}

BRIEFING: Negócio: ${b.business_name} | Segmento: ${b.segment} | Oferta: ${b.main_offer ?? "não informada"} | Público: ${b.target_audience ?? "não informado"} | Objetivo: ${b.goal ?? "não informado"} | Notas: ${b.notes ?? "nenhuma"}`;
}

function audiencePrompt(b: BriefingInput): string {
  return `Você é um especialista em persona e comportamento do consumidor. Retorne SOMENTE JSON válido, sem markdown:
{"primary_persona":"descrição da persona em 1-2 linhas","age_range":"faixa etária estimada","main_fears":["medo1","medo2","medo3"],"main_desires":["desejo1","desejo2","desejo3"],"buying_trigger":"principal gatilho de compra","objections":["objeção1","objeção2"]}

BRIEFING: Negócio: ${b.business_name} | Segmento: ${b.segment} | Público: ${b.target_audience ?? "não informado"} | Oferta: ${b.main_offer ?? "não informada"} | Objetivo: ${b.goal ?? "não informado"}`;
}

function designPrompt(b: BriefingInput): string {
  return `Você é um diretor de UX/UI especialista em sites de alta conversão. Retorne SOMENTE JSON válido, sem markdown:
{"recommended_style":"descrição do estilo visual","color_rationale":"justificativa da paleta","sections_recommended":["hero","about","services","testimonials","cta","contact"],"sections_order":["hero","about","services","testimonials","cta","contact"],"visual_references":["referência 1","referência 2"]}

BRIEFING: Negócio: ${b.business_name} | Segmento: ${b.segment} | Estilo: ${b.visual_style ?? "não informado"} | Objetivo: ${b.goal ?? "não informado"} | Público: ${b.target_audience ?? "não informado"}`;
}

// ─── OpenRouter API ───────────────────────────────────────────────────────────

const OPENROUTER_MODEL = "google/gemma-4-31b-it:free";

async function callOpenRouter(prompt: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.ai.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://publiciart.app",
      "X-Title": "Publiciart Builder",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err}`);
  }

  const data = await res.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  return data.choices[0].message.content;
}

function extractJSON(raw: string): unknown {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("JSON não encontrado na resposta da IA");
  return JSON.parse(match[0]);
}

// ─── Mocks ────────────────────────────────────────────────────────────────────

function mockBrand(b: BriefingInput): BrandAnalysis {
  return {
    positioning: `${b.business_name} é referência em ${b.segment}${b.city ? ` em ${b.city}` : ""} para quem busca resultado real.`,
    value_proposition: `${b.main_offer ?? "Serviço de qualidade"} com atendimento personalizado e resultados comprovados.`,
    brand_personality: ["Confiável", "Especialista", "Próximo"],
    tone_of_voice: "Direto, acolhedor e profissional — fala como quem entende do assunto mas não intimida.",
    key_differentiators: ["Atendimento personalizado", `Especialista em ${b.segment}`, "Resultado garantido"],
    archetype: "Especialista",
  };
}

function mockCopy(b: BriefingInput): CopyAnalysis {
  return {
    hero_headline: `${b.business_name}: ${b.main_offer ?? "resultado"} que transforma.`,
    hero_subheadline: `Atendemos ${b.target_audience ?? "você"} com qualidade e resultado real${b.city ? ` em ${b.city}` : ""}.`,
    primary_cta: "Falar no WhatsApp",
    about_paragraph: `A ${b.business_name} nasceu para oferecer ${b.main_offer ?? "serviço de excelência"}. Cada cliente é único e merece atenção diferenciada.`,
    pain_points: ["Dificuldade em encontrar profissionais de confiança", "Resultados inconsistentes", "Falta de transparência"],
    desires: ["Resultado rápido e duradouro", "Atendimento que respeita seu tempo", "Profissional que entende você"],
    social_proof_angle: "Clientes satisfeitos que indicam para amigos e família",
  };
}

function mockAudience(b: BriefingInput): AudienceAnalysis {
  return {
    primary_persona: `Pessoa que busca ${b.segment} de qualidade${b.city ? ` em ${b.city}` : ""}, valoriza profissionalismo e resultado.`,
    age_range: "25–45 anos",
    main_fears: ["Perder dinheiro com serviço ruim", "Não ter resultado esperado", "Ser mal atendido"],
    main_desires: ["Resolver o problema de vez", "Ser bem atendido", "Ter valor pelo que paga"],
    buying_trigger: "Indicação de amigo ou depoimento convincente",
    objections: ["Preço parece alto", "Não conheço o profissional"],
  };
}

function mockDesign(b: BriefingInput): DesignAnalysis {
  const dark = (b.visual_style ?? "").toLowerCase().includes("escuro") || (b.visual_style ?? "").toLowerCase().includes("premium");
  return {
    recommended_style: dark ? "Moderno escuro com acentos vibrantes — sofisticação e autoridade" : "Clean claro com acentos de cor — confiança e profissionalismo",
    color_rationale: `Paleta alinhada ao segmento ${b.segment}: transmite ${dark ? "exclusividade" : "confiança"}.`,
    sections_recommended: ["hero", "about", "services", "testimonials", "faq", "cta", "contact"],
    sections_order: ["hero", "about", "services", "testimonials", "faq", "cta", "contact"],
    visual_references: ["Design bold com tipografia impactante", "Imagens com overlay da cor da marca"],
  };
}

// ─── Orquestrador ─────────────────────────────────────────────────────────────

export async function analyzeWithSquads(briefing: BriefingInput): Promise<SquadAnalysisResult> {
  const useMock = !config.ai.apiKey || config.ai.provider === "mock";

  if (useMock) {
    await new Promise((r) => setTimeout(r, 1200));
    return {
      brand: mockBrand(briefing),
      copy: mockCopy(briefing),
      audience: mockAudience(briefing),
      design: mockDesign(briefing),
    };
  }

  const [brandRaw, copyRaw, audienceRaw, designRaw] = await Promise.all([
    callOpenRouter(brandPrompt(briefing)),
    callOpenRouter(copyPrompt(briefing)),
    callOpenRouter(audiencePrompt(briefing)),
    callOpenRouter(designPrompt(briefing)),
  ]);

  return {
    brand: extractJSON(brandRaw) as BrandAnalysis,
    copy: extractJSON(copyRaw) as CopyAnalysis,
    audience: extractJSON(audienceRaw) as AudienceAnalysis,
    design: extractJSON(designRaw) as DesignAnalysis,
  };
}
