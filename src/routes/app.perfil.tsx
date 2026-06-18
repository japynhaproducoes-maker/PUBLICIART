import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/perfil")({
  head: () => ({ meta: [{ title: "Meu perfil — Publiciart Builder" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await updateProfile({ name, email });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/entrar", replace: true });
  }

  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl border border-border card-elevated p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-xl font-bold text-white shadow-lg shadow-brand/30">
            {initials || "PA"}
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wider">
              <span className="rounded-full bg-brand/15 px-2 py-0.5 text-brand">
                Plano {user.plan_id === "pro" ? "Pro" : user.plan_id === "business" ? "Business" : user.plan_id === "full" ? "Publiciart Full" : "Start"}
              </span>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-muted-foreground">
                Papel: {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display font-semibold">Dados da conta</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">E-mail</label>
            <input
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
          {saved && <span className="text-xs font-medium text-success">Tudo certo!</span>}
        </div>
      </form>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display font-semibold">Sessão</h3>
        <p className="mt-1 text-sm text-muted-foreground">Sair desconecta este navegador.</p>
        <button
          onClick={handleSignOut}
          className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}
