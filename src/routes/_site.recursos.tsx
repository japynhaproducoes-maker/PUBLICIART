import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/page-header";

export const Route = createFileRoute("/_site/recursos")({
  head: () => ({ meta: [{ title: "Recursos — Publiciart Builder" }] }),
  component: () => (
    <>
      <PageHeader
        eyebrow="Recursos"
        title="Tudo pensado pra você vender mais"
        subtitle="Da geração com IA à publicação, com ferramentas que cabem na rotina de quem toca o negócio."
      />
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          {[
            ["IA conversacional em português", "Sem termos técnicos. Você fala, ela monta."],
            ["Preview ao vivo", "Veja as mudanças no mesmo instante."],
            ["Templates por segmento", "Modelos prontos para o seu tipo de negócio."],
            ["Editor visual", "Ajuste textos, cores e imagens quando quiser."],
            ["Publicação rápida", "Subdomínio grátis ou domínio próprio."],
            ["Exportação", "Baixe seu site quando precisar."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  ),
});
