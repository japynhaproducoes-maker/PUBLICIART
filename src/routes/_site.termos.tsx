import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/page-header";

export const Route = createFileRoute("/_site/termos")({
  head: () => ({ meta: [{ title: "Termos — Publiciart Builder" }] }),
  component: () => (
    <>
      <PageHeader eyebrow="Legal" title="Termos de uso" />
      <section className="mx-auto max-w-3xl px-4 pb-20 text-sm leading-7 text-muted-foreground sm:px-6">
        Conteúdo dos termos em construção.
      </section>
    </>
  ),
});
