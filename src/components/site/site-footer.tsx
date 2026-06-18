import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Sites inteligentes para negócios reais. Criação por IA, sem complicação.
          </p>
        </div>
        <FooterCol
          title="Plataforma"
          items={[
            { to: "/recursos", label: "Recursos" },
            { to: "/templates", label: "Templates" },
            { to: "/planos", label: "Planos e créditos" },
            { to: "/servicos", label: "Serviços extras" },
          ]}
        />
        <FooterCol
          title="Para você"
          items={[
            { to: "/segmentos", label: "Segmentos atendidos" },
            { to: "/exemplos", label: "Sites de exemplo" },
            { to: "/ajuda", label: "Central de ajuda" },
            { to: "/contato", label: "Falar com a gente" },
          ]}
        />
        <FooterCol
          title="Conta"
          items={[
            { to: "/entrar", label: "Entrar" },
            { to: "/cadastrar", label: "Criar conta" },
            { to: "/app", label: "Meu painel" },
          ]}
        />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
          <span>© {new Date().getFullYear()} Publiciart Builder. Feito no Brasil.</span>
          <div className="flex gap-4">
            <Link to="/termos">Termos</Link>
            <Link to="/privacidade">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-foreground">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="hover:text-foreground">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
