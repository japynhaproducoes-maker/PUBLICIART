import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/page-header";

const items = [
  "Barbearias e salões", "Clínicas de estética", "Restaurantes e delivery",
  "Eventos e festas", "Artistas e produtores", "Igrejas e comunidades",
  "Lojas locais", "Personal trainers", "Advogados", "Oficinas mecânicas",
  "Infoprodutores", "Freelancers",
];

export const Route = createFileRoute("/_site/segmentos")({
  head: () => ({ meta: [{ title: "Segmentos — Publiciart Builder" }] }),
  component: () => (
    <>
      <PageHeader eyebrow="Segmentos" title="Feito pra todo tipo de negócio brasileiro" />
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {items.map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium">{i}</div>
          ))}
        </div>
      </section>
    </>
  ),
});
