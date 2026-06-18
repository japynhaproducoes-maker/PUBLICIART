import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({ meta: [{ title: "Recuperar senha — Publiciart Builder" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await resetPassword(email);
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Logo className="mb-8" />
        <h1 className="font-display text-2xl font-bold">Recuperar senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vamos enviar um link pra você redefinir sua senha.
        </p>

        {sent ? (
          <div className="mt-6 rounded-2xl border border-success/30 bg-success/5 p-5 text-sm">
            <p className="font-semibold">Pronto! Confere seu e-mail.</p>
            <p className="mt-1 text-muted-foreground">
              Se houver uma conta associada a <strong>{email}</strong>, você vai
              receber um link pra redefinir a senha em alguns minutos. Confere
              também a caixa de spam.
            </p>
            <Link to="/entrar" className="mt-4 inline-block text-xs font-semibold text-brand hover:underline">
              ← Voltar pro login
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">E-mail</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="voce@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="block w-full rounded-lg bg-brand-gradient px-4 py-2.5 text-center text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar link"}
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
