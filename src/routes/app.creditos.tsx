import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Coins,
  TrendingUp,
  AlertTriangle,
  Crown,
  Sparkles,
  Plus,
  ArrowRight,
  Receipt,
  CalendarDays,
  ShoppingBag,
  Flame,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { creditsApi, plansApi } from "@/lib/api";
import type { CreditTransaction, Plan, PlanId } from "@/lib/types";
import {
  ACTION_CATALOG,
  CREDIT_PACKS,
  PLAN_MULTIPLIER,
  freeDailyRemaining,
  FREE_DAILY_ACTION_LIMIT,
  formatBRL,
  CREDIT_VALUE_BRL,
} from "@/lib/credits/pricing";
import { toast } from "sonner";

export const Route = createFileRoute("/app/creditos")({
  head: () => ({ meta: [{ title: "Créditos e plano — Publiciart Builder" }] }),
  component: CreditsPage,
});

function planLabel(id: PlanId | undefined) {
  if (id === "pro") return "Pro";
  if (id === "business") return "Business";
  if (id === "full") return "Publiciart Full";
  return "Start";
}

function CreditsPage() {
  const { user } = useAuth();
  const [tx, setTx] = useState<CreditTransaction[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  function refresh() {
    if (!user) return;
    creditsApi.listTxForUser(user.id).then(setTx);
    plansApi.list().then(setPlans);
  }

  useEffect(refresh, [user]);

  if (!user) return null;
  const currentPlan = plans.find((p) => p.id === user.plan_id);
  const monthlyGrant = currentPlan?.credits_per_month || 30;
  const balance = user.credits_balance;
  const pct = Math.min(100, Math.max(0, Math.round((balance / Math.max(1, monthlyGrant)) * 100)));

  const status: "ok" | "low" | "empty" =
    balance <= 0 ? "empty" : balance / Math.max(1, monthlyGrant) < 0.2 ? "low" : "ok";

  const usedThisMonth = useMemo(
    () => tx.filter((t) => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0),
    [tx],
  );

  const purchased = useMemo(
    () =>
      tx
        .filter((t) => t.type === "purchase" || t.type === "topup")
        .reduce((a, t) => a + t.amount, 0),
    [tx],
  );

  const topActions = useMemo(() => {
    const map = new Map<string, number>();
    tx.filter((t) => t.amount < 0).forEach((t) => {
      const key = t.metadata?.action_type ?? t.description;
      map.set(key, (map.get(key) ?? 0) + Math.abs(t.amount));
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, total]) => ({
        key,
        label: (ACTION_CATALOG as Record<string, { label: string }>)[key]?.label ?? key,
        total,
      }));
  }, [tx]);

  const dailyLeft = freeDailyRemaining(user.plan_id);

  async function buyPack(pack: (typeof CREDIT_PACKS)[number]) {
    if (!user) return;
    await creditsApi.topUp(user.id, pack.credits, pack.priceBRL, pack.label);
    toast.success(`+${pack.credits} créditos adicionados.`);
    refresh();
  }

  async function changePlan(planId: PlanId) {
    if (!user) return;
    await plansApi.changePlan(user.id, planId);
  }

  const nextPlan: PlanId | null =
    user.plan_id === "start" ? "pro" : user.plan_id === "pro" ? "business" : null;
  const nextPlanInfo = plans.find((p) => p.id === nextPlan);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Créditos e plano</h2>
        <p className="text-sm text-muted-foreground">
          Use créditos para criar, editar e melhorar seus projetos com IA. Ações mais
          complexas consomem mais. Seu site permanece online enquanto a assinatura estiver ativa.
        </p>
      </div>

      {user.plan_id === "start" && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <p className="font-semibold text-amber-700 dark:text-amber-200">Plano gratuito demonstrativo</p>
          <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-200/80">
            No plano gratuito, os créditos são demonstrativos e possuem consumo acelerado (x{PLAN_MULTIPLIER.start}).
            Faça upgrade para seus créditos renderem muito mais.
          </p>
        </div>
      )}

      {status === "empty" && <LimitReachedBanner nextPlan={nextPlanInfo} />}
      {status === "low" && <LowCreditsBanner balance={balance} total={monthlyGrant} />}

      {/* Balance card */}
      <div
        className={`overflow-hidden rounded-2xl border p-6 text-white ${
          status === "empty"
            ? "border-red-500/30 bg-gradient-to-br from-red-600 to-red-800"
            : "border-border bg-brand-gradient"
        }`}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              <p className="text-xs uppercase tracking-widest text-white/70">Saldo disponível</p>
            </div>
            <p className="mt-1 font-display text-4xl font-extrabold">
              {balance} <span className="text-base font-medium text-white/70">créditos</span>
            </p>
            <div className="mt-4 h-2 max-w-md overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-white transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-xs text-white/80">
              {balance} de {monthlyGrant} disponíveis no plano {planLabel(user.plan_id)} ·{" "}
              ~{formatBRL(balance * CREDIT_VALUE_BRL)} em valor.
            </p>
          </div>
          {nextPlan && (
            <button
              onClick={() => changePlan(nextPlan)}
              className="shrink-0 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand hover:bg-white/90"
            >
              Fazer upgrade
            </button>
          )}
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat icon={Sparkles} label="Mensal do plano" value={String(monthlyGrant)} sub="créditos por ciclo" />
        <MiniStat
          icon={CalendarDays}
          label="Diários grátis"
          value={user.plan_id === "start" && dailyLeft !== null ? `${dailyLeft}/${FREE_DAILY_ACTION_LIMIT}` : "—"}
          sub={user.plan_id === "start" ? "ações de IA hoje" : "ilimitado no plano pago"}
        />
        <MiniStat icon={ShoppingBag} label="Comprados" value={String(purchased)} sub="via top-up" />
        <MiniStat icon={TrendingUp} label="Usado este mês" value={String(usedThisMonth)} sub="créditos consumidos" />
      </div>

      {/* Top spending actions */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-brand" />
          <h3 className="font-display font-semibold">Ações que mais consomem</h3>
        </div>
        {topActions.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Sem consumo ainda. Crie seu primeiro site para começar.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {topActions.map((a) => {
              const max = topActions[0].total;
              return (
                <div key={a.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{a.label}</span>
                    <span className="text-muted-foreground">{a.total} créd.</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-brand-gradient" style={{ width: `${(a.total / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Top-up packs */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h3 className="font-display font-semibold">Comprar créditos extras (top-up)</h3>
            <p className="text-xs text-muted-foreground">Recarga rápida sem mudar de plano. 1 crédito ≈ {formatBRL(CREDIT_VALUE_BRL)}.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CREDIT_PACKS.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-2xl border p-5 text-center ${
                p.highlight ? "border-brand bg-brand-soft/40" : "border-border bg-card"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Mais usado
                </span>
              )}
              <p className="font-display text-lg font-bold">{p.credits} créditos</p>
              <p className="mt-1 text-2xl font-extrabold text-brand">R$ {p.priceBRL}</p>
              <p className="text-[11px] text-muted-foreground">{p.label}</p>
              <button
                onClick={() => buyPack(p)}
                className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background"
              >
                <Plus className="h-4 w-4" /> Comprar
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Current plan + change */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Plano atual</p>
            <h3 className="font-display text-lg font-bold">{currentPlan?.name ?? planLabel(user.plan_id)}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {currentPlan && currentPlan.price > 0
                ? `R$ ${currentPlan.price}/mês`
                : currentPlan?.price === -1
                ? "Sob consulta"
                : "Sem mensalidade"}{" "}
              — {currentPlan?.description}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Multiplicador de consumo deste plano: x{PLAN_MULTIPLIER[user.plan_id]}.
            </p>
          </div>
          <Link to="/planos" className="text-xs font-semibold text-brand hover:underline">
            Ver todos os planos →
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {plans
            .filter((p) => p.id !== user.plan_id && p.id !== "full")
            .map((p) => (
              <button
                key={p.id}
                onClick={() => changePlan(p.id)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:border-brand/40 hover:bg-brand-soft/40"
              >
                Mudar para {p.name} {p.price > 0 && `(R$ ${p.price}/mês)`}
              </button>
            ))}
        </div>
      </section>

      {/* History */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display font-semibold">Histórico</h3>
        {tx.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Sem movimentação ainda.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {tx.slice(0, 25).map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.description}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(t.created_at).toLocaleString("pt-BR")}
                    {t.metadata?.action_type ? ` · ${t.metadata.action_type}` : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 font-semibold ${
                    t.amount >= 0 ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {t.amount >= 0 ? "+" : ""}
                  {t.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function LimitReachedBanner({ nextPlan }: { nextPlan?: Plan }) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
      <div className="grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-center">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-red-500 text-white">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display font-semibold">Você chegou ao limite do seu plano.</p>
          <p className="text-sm text-muted-foreground">
            Faça upgrade para continuar criando sites com IA{nextPlan ? `, ou compre um pacote extra.` : "."}
          </p>
        </div>
        {nextPlan && (
          <Link
            to="/planos"
            className="inline-flex items-center gap-1 rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Crown className="h-4 w-4" /> Upgrade para {nextPlan.name} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

function LowCreditsBanner({ balance, total }: { balance: number; total: number }) {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500 text-white">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Seus créditos estão acabando</p>
          <p className="text-xs text-muted-foreground">
            Restam apenas {balance} de {total}. Considere um upgrade ou pacote extra para não parar a produção.
          </p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Coins;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-soft text-brand">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}
