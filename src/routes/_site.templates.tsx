import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/page-header";

const templates = [
  { name: "Barbearia Moderna", tag: "Serviços" },
  { name: "Clínica de Estética", tag: "Saúde" },
  { name: "Restaurante Local", tag: "Alimentação" },
  { name: "Evento & Festa", tag: "Eventos" },
  { name: "Artista Musical", tag: "Arte" },
  { name: "Personal Trainer", tag: "Fitness" },
  { name: "Advocacia", tag: "Profissional" },
  { name: "Loja Local", tag: "Comércio" },
  { name: "Igreja", tag: "Comunidade" },
];

export const Route = createFileRoute("/_site/templates")({
  head: () => ({ meta: [{ title: "Templates — Publiciart Builder" }] }),
  component: () => (
    <>
      <PageHeader
        eyebrow="Templates"
        title="Comece de um modelo pronto"
        subtitle="Cada template é otimizado para um segmento. Personalize tudo por conversa."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t, i) => (
            <Link
              key={t.name}
              to="/cadastrar"
              className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/5"
            >
              <div
                className="aspect-[4/3] w-full"
                style={{
                  background: `linear-gradient(135deg, oklch(${0.5 + (i % 3) * 0.1} 0.2 ${260 + i * 18}), oklch(0.75 0.15 ${30 + i * 12}))`,
                }}
              />
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{t.tag}</p>
                  <h3 className="font-display font-semibold">{t.name}</h3>
                </div>
                <span className="rounded-md bg-brand-soft px-2 py-1 text-xs font-semibold text-brand opacity-0 transition group-hover:opacity-100">
                  Usar →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  ),
});
