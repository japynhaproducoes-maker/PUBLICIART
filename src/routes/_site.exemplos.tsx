import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/page-header";

export const Route = createFileRoute("/_site/exemplos")({
  head: () => ({ meta: [{ title: "Exemplos — Publiciart Builder" }] }),
  component: () => (
    <>
      <PageHeader eyebrow="Exemplos" title="Sites criados na plataforma" subtitle="Em breve, uma galeria com casos reais." />
      <section className="mx-auto max-w-5xl px-4 pb-20 text-center text-muted-foreground sm:px-6">
        Estamos reunindo os primeiros exemplos. Volte em breve.
      </section>
    </>
  ),
});
