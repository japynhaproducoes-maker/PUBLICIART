/**
 * Erros padronizados da camada de API.
 *
 * Toda função em `lib/api/endpoints/*` deve lançar um `ApiError` para que a UI
 * tenha um contrato único de tratamento (try/catch + toast/UI feedback).
 */

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "INSUFFICIENT_CREDITS"
  | "RATE_LIMITED"
  | "NETWORK"
  | "UNKNOWN";

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;
  details?: unknown;

  constructor(code: ApiErrorCode, message: string, status = 400, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/** Normaliza qualquer erro (mock ou HTTP) em um `ApiError`. */
export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (err instanceof Error) {
    return new ApiError("UNKNOWN", err.message, 500, err);
  }
  return new ApiError("UNKNOWN", "Erro desconhecido.", 500, err);
}

/** Mensagens amigáveis prontas para usar em toasts. */
export function friendlyMessage(err: unknown): string {
  const e = toApiError(err);
  switch (e.code) {
    case "UNAUTHORIZED":
      return "Sessão expirada. Faça login novamente.";
    case "FORBIDDEN":
      return "Você não tem permissão para essa ação.";
    case "NOT_FOUND":
      return "Recurso não encontrado.";
    case "VALIDATION":
      return e.message || "Verifique os dados informados.";
    case "CONFLICT":
      return e.message || "Conflito ao salvar.";
    case "INSUFFICIENT_CREDITS":
      return "Créditos insuficientes. Faça upgrade do seu plano.";
    case "RATE_LIMITED":
      return "Muitas requisições. Tente novamente em instantes.";
    case "NETWORK":
      return "Sem conexão com o servidor.";
    default:
      return e.message || "Algo deu errado. Tente novamente.";
  }
}
