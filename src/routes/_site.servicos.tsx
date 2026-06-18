import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/page-header";
import { Mic, Palette, Video, Megaphone, Wrench, Image } from "lucide-react";

const services = [
  { icon: Palette, name: "Logo profissional", price: "a partir de R$ 89", desc: "Criação de logo e variações para seu negócio." },
  { icon: Image, name: "Identidade visual", price: "a partir de R$ 249", desc: "Paleta, tipografia e aplicações prontas." },
  { icon: Video, name: "Vídeo institucional", price: "a partir de R$ 199", desc: "Vídeo curto pra redes sociais e site." },
  { icon: Mic, name: "Jingle e locução", price: "a partir de R$ 149", desc: "Áudio comercial gravado em estúdio." },
  { icon: Megaphone, name: "Tráfego pago", price: "a partir de R$ 299/mês", desc: "Campanhas no Instagram e Google." },
  { icon: Wrench, name: "Manutenção mensal", price: "a partir de R$ 79/mês", desc: "Atualizações, backup e suporte." },
];

export const Route = createFileRoute("/_site/servicos")({
  head: () => ({ meta: [{ title: "Serviços extras — Publiciart Builder" }] }),
  component: () => (
    <>
      <PageHeader
        eyebrow="Serviços extras"
        title="Quando precisar de gente, a gente faz"
        subtitle="Logo, vídeo, tráfego, identidade e mais — direto pela plataforma, sem ficar caçando freelancer."
      />
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.name} className="rounded-2xl border border-border bg-card p-6">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-soft text-brand">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{s.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              <p className="mt-4 text-sm font-semibold text-brand">{s.price}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  ),
});
