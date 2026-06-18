/**
 * Serviço de IA.
 *
 * Hoje: usa o gerador mock local (`lib/generator.ts`).
 * Amanhã: trocar `generateSite` por uma chamada HTTP ao provedor configurado
 * em `appConfig.ai` (OpenAI, Gemini, endpoint próprio), mantendo a assinatura.
 */

import { generateSiteFromBriefing, type BriefingInput, type GeneratedSiteResult } from "@/lib/generator";
import { appConfig } from "@/config/app";

export const aiService = {
  provider: appConfig.ai.provider,

  async generateSite(briefing: BriefingInput): Promise<GeneratedSiteResult> {
    // TODO: quando appConfig.ai.provider !== "mock", chamar appConfig.ai.apiUrl
    return generateSiteFromBriefing(briefing);
  },

  async refineSection(_sectionId: string, _instruction: string): Promise<void> {
    // Placeholder — futura edição por comando de IA.
  },
};

export type { BriefingInput, GeneratedSiteResult };
