import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/page-header";

export const Route = createFileRoute("/_site/contato")({
  head: () => ({ meta: [{ title: "Contato — Publiciart Builder" }] }),
  component: () => (
    <>
      <PageHeader eyebrow="Contato" title="Fale com a gente" subtitle="Respondemos rápido em horário comercial." />
      <section className="mx-auto max-w-xl px-4 pb-20 sm:px-6">
        <form className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div>
            <label className="mb-1 block text-sm font-medium">Nome</label>
            <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Seu nome" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">E-mail</label>
            <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="voce@email.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Mensagem</label>
            <textarea rows={4} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Como podemos ajudar?" />
          </div>
          <button type="button" className="w-full rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white">
            Enviar mensagem
          </button>
        </form>
      </section>
    </>
  ),
});
