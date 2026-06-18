import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Logo } from "@/components/brand/logo";
import { useAuth } from "@/lib/auth";

const searchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/resetar-senha")({
  head: () => ({ meta: [{ title: "Definir nova senha — Publiciart Builder" }] }),
  validateSearch: (s) => searchSchema.parse(s),
  component: ResetPasswordConfirm,
});

function ResetPasswordConfirm() {
  const { token } = Route.useSearch();
  const { confirmPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("Link inválido ou expirado. Solicite um novo.");
      return;
    }
    if (password.length < 8) {
      setError("Sua senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(token, password);
      setDone(true);
      setTimeout(() => navigate({ to: "/entrar" }), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível redefinir.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Logo className="mb-8" />
        <h1 className="font-display text-2xl font-bold">Definir nova senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha uma senha forte com pelo menos 8 caracteres.
        </p>

        {done ? (
          <div className="mt-6 rounded-2xl border border-success/30 bg-success/5 p-5 text-sm">
            <p className="font-semibold">Senha atualizada!</p>
            <p className="mt-1 text-muted-foreground">
              Redirecionando pro login...
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nova senha</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Confirmar senha</label>
              <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                type="password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="Repita a senha"
              />
            </div>
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="block w-full rounded-lg bg-brand-gradient px-4 py-2.5 text-center text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>
            <Link to="/entrar" className="block text-center text-xs text-muted-foreground hover:text-foreground">
              ← Voltar pro login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
