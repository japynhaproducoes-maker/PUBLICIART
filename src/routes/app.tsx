import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AppSidebar, AppTopbar, MobileBottomNav } from "@/components/app/app-shell";
import { RequireAuth } from "@/lib/auth";

const titles: Record<string, string> = {
  "/app": "Visão geral",
  "/app/criador": "Novo projeto",
  "/app/projetos": "Meus sites",
  "/app/templates": "Biblioteca de templates",
  "/app/briefings": "Briefings",
  "/app/publicacao": "Publicações",
  "/app/servicos": "Pedidos extras",
  "/app/esteira": "Esteira de produção",
  "/app/admin": "Admin — pedidos",
  "/app/creditos": "Créditos e plano",
  "/app/configuracoes": "Configurações",
  "/app/perfil": "Meu perfil",
};


export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = titles[pathname] ?? "Publiciart Builder";
  return (
    <RequireAuth>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar title={title} />
          <main className="flex-1 overflow-auto p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
            <Outlet />
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </RequireAuth>
  );
}
