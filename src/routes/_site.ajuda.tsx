import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/page-header";

const faqs: [string, string][] = [
  [
    "Preciso saber programar?",
    "Não. Você conversa com a IA, escolhe um template e a Publiciart monta tudo pra você.",
  ],
  [
    "Preciso pagar mensalidade para manter o site no ar?",
    "Sim. Seu site permanece publicado dentro da Publiciart enquanto seu plano estiver ativo.",
  ],
  [
    "Posso usar meu domínio próprio?",
    "Sim. Domínio próprio está disponível nos planos Pro, Business e Publiciart Full. Nos planos gratuitos, o site fica em um subdomínio publiciart.app.",
  ],
  [
    "O que acontece se meus créditos acabarem?",
    "Você pode esperar a renovação mensal do seu plano, comprar um pacote extra ou fazer upgrade.",
  ],
  [
    "O plano grátis publica site?",
    "O plano grátis serve pra testar a plataforma. A publicação fica em subdomínio publiciart.app, com a marca \"Criado com Publiciart Builder\" visível.",
  ],
  [
    "Posso remover a marca Publiciart?",
    "Sim, a remoção do badge está disponível a partir do plano Pro.",
  ],
  [
    "O que são créditos?",
    "Cada ação com IA (gerar site, regenerar uma seção, melhorar copy, criar variações, gerar FAQ, criar página de vendas, mudar estilo) consome créditos. Todo mês seu plano renova a cota.",
  ],
  [
    "Posso cancelar quando quiser?",
    "Pode. Se cancelar, seu site fica suspenso até você reativar a assinatura — seus dados ficam guardados.",
  ],
];

export const Route = createFileRoute("/_site/ajuda")({
  head: () => ({ meta: [{ title: "Ajuda — Publiciart Builder" }] }),
  component: () => (
    <>
      <PageHeader eyebrow="Central de ajuda" title="Tire suas dúvidas" />
      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {faqs.map(([q, a]) => (
            <div key={q} className="p-5">
              <h3 className="font-semibold">{q}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Não encontrou? Fale com a gente em <a href="/contato" className="text-brand hover:underline">/contato</a>.
        </p>
      </section>
    </>
  ),
});
