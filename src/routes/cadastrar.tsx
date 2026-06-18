import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/cadastrar")({
  head: () => ({ meta: [{ title: "Criar conta — Publiciart Builder" }] }),
  component: SignUp,
});

function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) {
      setError("Preencha nome e e-mail.");
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
      await signUp(name.trim(), email.trim(), password);
      navigate({ to: "/app" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não conseguimos criar a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <Logo className="mb-8" />
          <h1 className="font-display text-2xl font-bold">Crie sua conta grátis</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sem cartão. Comece em 1 minuto.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Seu nome</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="Como podemos te chamar?"
              />
            </div>
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
              {loading ? "Criando..." : "Criar minha conta"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/entrar" className="font-semibold text-brand hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden bg-[oklch(0.16_0.03_280)] p-12 text-white lg:flex lg:flex-col lg:justify-end">
        <h2 className="font-display text-3xl font-bold">Sites inteligentes pra negócios reais.</h2>
        <p className="mt-3 text-white/70">Conte sobre o seu negócio. A IA cuida do resto.</p>
      </div>
    </div>
  );
}
