import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/page-header";

export const Route = createFileRoute("/_site/privacidade")({
  head: () => ({ meta: [{ title: "Privacidade — Publiciart Builder" }] }),
  component: () => (
    <>
      <PageHeader eyebrow="Legal" title="Política de privacidade" />
      <section className="mx-auto max-w-3xl px-4 pb-20 text-sm leading-7 text-muted-foreground sm:px-6">
        Conteúdo da política em construção.
      </section>
    </>
  ),
});
