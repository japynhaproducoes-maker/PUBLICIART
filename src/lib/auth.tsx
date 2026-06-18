import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authApi } from "@/lib/api";
import { store } from "@/lib/data/store";
import type { Permission, User, UserRole } from "@/lib/types";
import { can } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (name: string, email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, password: string) => Promise<void>;
  updateProfile: (patch: Partial<Pick<User, "name" | "avatar_url" | "email">>) => Promise<User>;
  hasRole: (role: UserRole) => boolean;
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hidrata sessão + reage a mudanças no store (multi-aba também via storage event)
  useEffect(() => {
    const refresh = () => setUser(authApi.getCurrentUser());
    refresh();
    setLoading(false);
    const unsub = store.subscribe(refresh);
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => {
      unsub();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const u = await authApi.signIn({ email, password });
    setUser(u);
    return u;
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const u = await authApi.signUp({ name, email, password });
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(async () => {
    await authApi.signOut();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await authApi.resetPassword(email);
  }, []);

  const confirmPasswordReset = useCallback(async (token: string, password: string) => {
    await authApi.confirmPasswordReset(token, password);
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<Pick<User, "name" | "avatar_url" | "email">>) => {
      const u = await authApi.updateProfile(patch);
      setUser(u);
      return u;
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      signIn,
      signUp,
      signOut,
      resetPassword,
      confirmPasswordReset,
      updateProfile,
      hasRole: (role) => user?.role === role,
      can: (permission) => can(user?.role, permission),
    }),
    [user, loading, signIn, signUp, signOut, resetPassword, confirmPasswordReset, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}

/**
 * Gate de rota para área autenticada.
 * Redireciona pra /entrar quando não há sessão.
 * Quando o backend real estiver conectado, trocar pelo padrão TanStack
 * `_authenticated/` layout do Supabase.
 */
export function RequireAuth({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: "/entrar", replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || !isAuthenticated) {
    return (
      <>
        {fallback ?? (
          <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
            Carregando...
          </div>
        )}
      </>
    );
  }
  return <>{children}</>;
}

/**
 * Gate de permissão dentro da área logada.
 */
export function RequirePermission({
  permission,
  children,
  denied,
}: {
  permission: Permission;
  children: ReactNode;
  denied?: ReactNode;
}) {
  const { can: hasPerm, loading } = useAuth();
  if (loading) return null;
  if (!hasPerm(permission)) {
    return <>{denied ?? <NoPermissionFallback />}</>;
  }
  return <>{children}</>;
}

function NoPermissionFallback() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="max-w-sm rounded-2xl border border-warning/30 bg-warning/5 p-6 text-center">
        <h3 className="font-display text-lg font-semibold">Sem permissão</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Você não tem acesso a esta área. Fale com o administrador da conta.
        </p>
      </div>
    </div>
  );
}
