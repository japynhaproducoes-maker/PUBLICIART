/**
 * Configuração central do Publiciart Builder.
 *
 * Lê variáveis de ambiente (VITE_*) com fallbacks seguros para
 * funcionamento independente, sem depender de nenhum backend externo.
 *
 * Para produção própria, configurar via `.env` (ver `.env.example`).
 */

const env = import.meta.env;

export const appConfig = {
  name: env.VITE_APP_NAME ?? "Publiciart Builder",
  shortName: "Publiciart",
  url: env.VITE_APP_URL ?? "https://publiciart.app",
  environment: (env.MODE ?? "development") as "development" | "production" | "test",

  /** URL base da API real (quando a camada mock for substituída). */
  apiBaseUrl: env.VITE_API_BASE_URL ?? "",

  /** Provedor de IA — "mock" mantém geração local; troque para "openai" / "gemini" etc. */
  ai: {
    provider: env.VITE_AI_PROVIDER ?? "mock",
    apiUrl: env.VITE_AI_API_URL ?? "",
  },

  /** Storage de assets (imagens, exportações). */
  storageUrl: env.VITE_STORAGE_URL ?? "",

  /** Limites comerciais — refletidos também em `data/mockPlans`. */
  credits: {
    siteGenerationCost: 10,
    sectionEditCost: 1,
    welcomeBonus: 30,
  },

  /** Identificadores canônicos dos planos. */
  plans: {
    start: "start",
    pro: "pro",
    agency: "agency",
  } as const,

  /** Feature flags — permitem ligar/desligar partes do produto sem deploy. */
  features: {
    aiBuilder: true,
    templatesLibrary: true,
    extraServices: true,
    productionPipeline: true,
    adminPanel: true,
    customDomains: false, // futuro
    htmlExport: false, // futuro
  },
} as const;

export type AppConfig = typeof appConfig;
