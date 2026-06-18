import { createFileRoute, Link } from "@tanstack/react-router";
import { ErrorState } from "@/components/global";

export const Route = createFileRoute("/sem-permissao")({
  head: () => ({ meta: [{ title: "Sem permissão — Publiciart Builder" }] }),
  component: () => (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md">
        <ErrorState
          title="Você não tem acesso a esta área"
          description="Fale com o administrador da sua conta pra liberar essa parte da plataforma."
          action={
            <Link to="/app" className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white">
              Voltar pro painel
            </Link>
          }
        />
      </div>
    </div>
  ),
});
