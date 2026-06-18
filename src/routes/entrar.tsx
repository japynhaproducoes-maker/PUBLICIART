import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/entrar")({
  head: () => ({ meta: [{ title: "Entrar — Publiciart Builder" }] }),
  component: SignIn,
});

function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      navigate({ to: "/app" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não conseguimos entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <Logo className="mb-8" />
          <h1 className="font-display text-2xl font-bold">Bem-vindo de volta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Entre pra continuar criando.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">E-mail</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="voce@email.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Senha</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="••••••••"
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
              {loading ? "Entrando..." : "Entrar"}
            </button>
            <div className="flex items-center justify-between text-xs">
              <Link to="/recuperar-senha" className="text-muted-foreground hover:text-foreground">
                Esqueci minha senha
              </Link>
              <Link to="/cadastrar" className="font-semibold text-brand hover:underline">
                Criar conta
              </Link>
            </div>
          </form>
          <p className="mt-6 rounded-lg border border-border bg-surface/60 p-3 text-[11px] text-muted-foreground">
            Modo demo: qualquer e-mail/senha entra. O backend real será conectado depois.
          </p>
        </div>
      </div>
      <div className="hidden bg-brand-gradient p-12 text-white lg:flex lg:flex-col lg:justify-end">
        <blockquote className="font-display text-2xl leading-snug">
          "Em uma tarde meu site estava no ar. Agora os clientes agendam sozinhos."
        </blockquote>
        <p className="mt-4 text-sm text-white/80">— Marcos, Barbearia Studio do João</p>
      </div>
    </div>
  );
}
