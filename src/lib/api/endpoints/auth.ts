/**
 * Endpoints — Auth
 *
 * Hoje: delega para `lib/api.ts` (mock + localStorage).
 * Backend real: trocar o corpo de cada função por `apiClient.request(...)`.
 */

import { authApi } from "@/lib/api";
import { apiClient } from "../client";
import { toApiError } from "../errors";
import type { LoginInput, RegisterInput, User } from "../types";

export const authEndpoints = {
  async login(input: LoginInput): Promise<User> {
    try {
      if (apiClient.isRemote) {
        const res = await apiClient.request<{ user: User; token: string }>("/auth/login", {
          method: "POST",
          body: input,
        });
        apiClient.setToken(res.token);
        return res.user;
      }
      return await authApi.signIn(input);
    } catch (e) { throw toApiError(e); }
  },

  async register(input: RegisterInput): Promise<User> {
    try {
      if (apiClient.isRemote) {
        const res = await apiClient.request<{ user: User; token: string }>("/auth/register", {
          method: "POST",
          body: input,
        });
        apiClient.setToken(res.token);
        return res.user;
      }
      return await authApi.signUp(input);
    } catch (e) { throw toApiError(e); }
  },

  async logout(): Promise<void> {
    try {
      if (apiClient.isRemote) {
        await apiClient.request<void>("/auth/logout", { method: "POST" });
        apiClient.setToken(null);
        return;
      }
      await authApi.signOut();
    } catch (e) { throw toApiError(e); }
  },

  getCurrentUser(): User | null {
    // Mock: lê direto do store. Real: cache local + endpoint /auth/me.
    return authApi.getCurrentUser();
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      if (apiClient.isRemote) {
        await apiClient.request<void>("/auth/forgot-password", { method: "POST", body: { email } });
        return;
      }
      await authApi.resetPassword(email);
    } catch (e) { throw toApiError(e); }
  },

  /** Alias mantido por compatibilidade com chamadas antigas. */
  async resetPassword(email: string): Promise<void> {
    return this.forgotPassword(email);
  },

  async confirmPasswordReset(token: string, password: string): Promise<void> {
    try {
      if (apiClient.isRemote) {
        await apiClient.request<void>("/auth/reset-password", {
          method: "POST",
          body: { token, password },
        });
        return;
      }
      await authApi.confirmPasswordReset(token, password);
    } catch (e) { throw toApiError(e); }
  },
};
