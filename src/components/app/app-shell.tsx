import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Sparkles,
  FolderKanban,
  LayoutTemplate,
  Rocket,
  ShoppingBag,
  Coins,
  Settings,
  LogOut,
  User as UserIcon,
  ClipboardList,
  Plus,
  Factory,
  Shield,
} from "lucide-react";
import type { ComponentType } from "react";
import { Logo } from "@/components/brand/logo";
import { useAuth } from "@/lib/auth";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const nav: NavItem[] = [
  { to: "/app", label: "Visão geral", icon: LayoutDashboard },
  { to: "/app/criador", label: "Novo projeto", icon: Sparkles },
  { to: "/app/projetos", label: "Meus sites", icon: FolderKanban },
  { to: "/app/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/app/briefings", label: "Briefings", icon: ClipboardList },
  { to: "/app/creditos", label: "Créditos", icon: Coins },
  { to: "/app/servicos", label: "Pedidos extras", icon: ShoppingBag },
  { to: "/app/esteira", label: "Esteira de produção", icon: Factory },
  { to: "/app/publicacao", label: "Publicações", icon: Rocket },
  { to: "/app/admin", label: "Admin pedidos", icon: Shield, adminOnly: true },
  { to: "/app/configuracoes", label: "Configurações", icon: Settings },
];

const mobileNav: NavItem[] = [
  { to: "/app", label: "Início", icon: LayoutDashboard },
  { to: "/app/esteira", label: "Esteira", icon: Factory },
  { to: "/app/criador", label: "Criar", icon: Plus },
  { to: "/app/servicos", label: "Extras", icon: ShoppingBag },
  { to: "/app/perfil", label: "Perfil", icon: UserIcon },
];


function planLabel(plan: string | undefined) {
  if (plan === "pro") return "Pro";
  if (plan === "business") return "Business";
  if (plan === "full") return "Publiciart Full";
  return "Start";
}

function planCap(plan: string | undefined) {
  if (plan === "pro") return 300;
  if (plan === "business") return 1500;
  if (plan === "full") return 9999;
  return 30;
}

function isActiveRoute(pathname: string, to: string) {
  return to === "/app" ? pathname === "/app" : pathname.startsWith(to);
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const balance = user?.credits_balance ?? 0;
  const total = planCap(user?.plan_id);
  const pct = Math.min(100, Math.round((balance / total) * 100));

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/entrar", replace: true });
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav
          .filter((item) => !item.adminOnly || user?.role === "admin")
          .map((item) => {
            const active = isActiveRoute(pathname, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="mb-3 rounded-lg bg-sidebar-accent p-3 text-xs">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold">Créditos</span>
            <span className="text-sidebar-foreground/70">
              {balance} / {total}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-sidebar-border">
            <div className="h-full bg-brand-gradient" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Plano {planLabel(user?.plan_id)}
            </span>
            <Link to="/app/creditos" className="text-[11px] font-medium text-sidebar-primary hover:underline">
              Comprar
            </Link>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}

export function AppTopbar({ title }: { title: string }) {
  const { user } = useAuth();
  const initials = (user?.name ?? "PA")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const balance = user?.credits_balance ?? 0;
  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Publiciart</p>
        <h1 className="-mt-0.5 truncate font-display text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/app/creditos"
          className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-brand/40 sm:inline-flex"
          title="Créditos disponíveis"
        >
          <Coins className="h-3.5 w-3.5 text-brand" />
          {balance}
          <span className="text-muted-foreground">créditos</span>
        </Link>
        <Link
          to="/app/creditos"
          className="hidden items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand sm:inline-flex"
        >
          Plano {planLabel(user?.plan_id)}
        </Link>
        <Link
          to="/app/criador"
          className="hidden rounded-lg bg-brand-gradient px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-brand/25 hover:opacity-95 sm:inline-flex"
        >
          + Novo projeto
        </Link>
        <Link
          to="/app/perfil"
          className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-sm font-semibold text-foreground ring-1 ring-white/10 hover:ring-brand/40"
          title={user?.name ?? "Perfil"}
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {mobileNav.map((item) => {
          const active = isActiveRoute(pathname, item.to);
          const isCreate = item.to === "/app/criador";
          return (
            <li key={item.to} className="flex items-center justify-center">
              <Link
                to={item.to}
                className={`flex w-full flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? "text-brand" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isCreate ? (
                  <span className="-mt-5 grid h-12 w-12 place-items-center rounded-full bg-brand-gradient text-white shadow-lg shadow-brand/40 ring-4 ring-background">
                    <item.icon className="h-5 w-5" />
                  </span>
                ) : (
                  <item.icon className="h-5 w-5" />
                )}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
