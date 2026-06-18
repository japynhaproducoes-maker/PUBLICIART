/**
 * Error reporter genérico.
 *
 * Mantém uma assinatura simples para registro de erros em produção.
 * Por padrão apenas loga no console. Para integrar Sentry, LogRocket,
 * Datadog, etc., implementar dentro de `reportAppError`.
 */

export interface ErrorContext {
  boundary?: string;
  route?: string;
  [key: string]: unknown;
}

export function reportAppError(error: unknown, context: ErrorContext = {}): void {
  if (typeof window === "undefined") {
    console.error("[app-error:server]", error, context);
    return;
  }
  const enriched = { route: window.location.pathname, ...context };
  console.error("[app-error]", error, enriched);
  // TODO: enviar para serviço de observabilidade (Sentry/Datadog) quando configurado.
}
