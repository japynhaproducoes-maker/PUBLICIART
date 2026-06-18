/**
 * API client — wrapper único para chamadas HTTP futuras.
 *
 * Hoje: a maior parte dos endpoints delega para o mock em `lib/api.ts`
 * (localStorage). Este client está pronto para, quando `appConfig.apiBaseUrl`
 * estiver definido, executar chamadas HTTP reais ao backend próprio.
 *
 * --- COMO LIGAR BACKEND REAL ---
 * 1. Definir `VITE_API_BASE_URL` no `.env.local`.
 * 2. Substituir cada endpoint em `lib/api/endpoints/*` por uma chamada
 *    a `apiClient.request(...)` mantendo a mesma assinatura.
 * 3. A UI não precisa mudar — já consome via `services/` e `endpoints/`.
 */

import { appConfig } from "@/config/app";
import { ApiError, toApiError } from "./errors";

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

const TOKEN_KEY = "publiciart.auth_token";

export const apiClient = {
  get baseUrl() {
    return appConfig.apiBaseUrl;
  },

  /** Se houver baseUrl configurada, executamos a chamada HTTP real. */
  get isRemote() {
    return Boolean(appConfig.apiBaseUrl);
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string | null) {
    if (typeof window === "undefined") return;
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    if (!this.isRemote) {
      // Em modo mock, o client nunca deve ser chamado diretamente — os
      // endpoints delegam ao adaptador mock. Mantido aqui para futuro.
      throw new ApiError("NETWORK", "API remota não configurada (VITE_API_BASE_URL vazio).", 500);
    }

    const url = new URL(path.replace(/^\//, ""), this.baseUrl.replace(/\/?$/, "/"));
    if (opts.query) {
      for (const [k, v] of Object.entries(opts.query)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }

    const token = this.getToken();
    try {
      const res = await fetch(url.toString(), {
        method: opts.method ?? "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(opts.headers ?? {}),
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        signal: opts.signal,
      });

      if (!res.ok) {
        const detail = await safeJson(res);
        const code =
          res.status === 401 ? "UNAUTHORIZED"
          : res.status === 403 ? "FORBIDDEN"
          : res.status === 404 ? "NOT_FOUND"
          : res.status === 409 ? "CONFLICT"
          : res.status === 422 ? "VALIDATION"
          : res.status === 429 ? "RATE_LIMITED"
          : "UNKNOWN";
        throw new ApiError(code, (detail as { message?: string })?.message ?? res.statusText, res.status, detail);
      }

      if (res.status === 204) return undefined as T;
      return (await res.json()) as T;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw toApiError(err);
    }
  },
};

async function safeJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
