import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Publiciart Builder" }] }),
  component: () => (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Configurações</h2>
        <p className="text-sm text-muted-foreground">Sua conta e preferências.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display font-semibold">Perfil</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Nome" placeholder="Seu nome" />
          <Field label="E-mail" placeholder="voce@email.com" />
          <Field label="Telefone" placeholder="(00) 00000-0000" />
          <Field label="Empresa" placeholder="Opcional" />
        </div>
        <button className="mt-5 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white">Salvar alterações</button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display font-semibold">Segurança</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Senha atual" placeholder="••••••••" type="password" />
          <Field label="Nova senha" placeholder="Mínimo 8 caracteres" type="password" />
        </div>
        <button className="mt-5 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted">Alterar senha</button>
      </div>

      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <h3 className="font-display font-semibold text-destructive">Excluir conta</h3>
        <p className="mt-1 text-sm text-muted-foreground">Isso remove seus dados de forma permanente.</p>
        <button className="mt-4 rounded-lg border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground">
          Excluir minha conta
        </button>
      </div>
    </div>
  ),
});

function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input type={type} placeholder={placeholder} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
    </div>
  );
}
