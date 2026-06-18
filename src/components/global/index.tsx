import { cn } from "@/lib/utils";
import type { ComponentType, ReactNode } from "react";
import {
  Inbox,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  Coins,
  Sparkles,
} from "lucide-react";

/* ============================================================
 * STATES — Empty, Loading, Error, Success
 * ============================================================ */

type StateProps = {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon: Icon = Inbox, action, className }: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-14 text-center", className)}>
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingState({
  title = "Estamos montando seu site...",
  description = "Isso leva alguns segundos. Pode respirar fundo. ✨",
  className,
}: { title?: string; description?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-border bg-surface/60 px-6 py-14 text-center", className)}>
      <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="absolute inset-0 animate-pulse rounded-2xl ring-2 ring-brand/40" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function ErrorState({
  title = "Algo deu errado por aqui",
  description = "Tenta de novo em alguns segundos. Se persistir, fala com a gente.",
  action,
  className,
}: { title?: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-14 text-center", className)}>
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-destructive/15 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SuccessState({
  title = "Tudo certo!",
  description = "Sua página está pronta para o mundo.",
  action,
  className,
}: { title?: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-success/30 bg-success/5 px-6 py-14 text-center", className)}>
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-success/15 text-success">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LimitReachedState({
  action,
  className,
}: { action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-warning/30 bg-warning/5 px-6 py-12 text-center", className)}>
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-warning/15 text-warning">
        <Coins className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">Seu limite de créditos foi atingido</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Recarregue para continuar criando agora mesmo, sem perder o ritmo.
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ============================================================
 * BADGE
 * ============================================================ */

type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "violet" | "gold";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-white/5 text-muted-foreground ring-white/10",
  brand: "bg-brand/10 text-brand ring-brand/30",
  success: "bg-success/10 text-success ring-success/30",
  warning: "bg-warning/10 text-warning ring-warning/30",
  danger: "bg-destructive/10 text-destructive ring-destructive/30",
  violet: "bg-violet/10 text-violet ring-violet/30",
  gold: "bg-gold/10 text-gold ring-gold/30",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ============================================================
 * BUTTONS (versões premium prontas)
 * ============================================================ */

export function PrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:opacity-95 hover:shadow-brand/40 disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white/10 disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ============================================================
 * CARDS
 * ============================================================ */

export function SurfaceCard({
  children,
  className,
}: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border card-elevated p-6", className)}>{children}</div>
  );
}

export function PricingCard({
  name,
  price,
  period = "/mês",
  description,
  features,
  cta,
  highlight = false,
  badge,
}: {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  cta: ReactNode;
  highlight?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-7 transition",
        highlight
          ? "border-brand/50 card-elevated glow-brand"
          : "border-border bg-surface/60 hover:border-white/15",
      )}
    >
      {badge && (
        <span className="absolute -top-3 left-7 rounded-full bg-brand-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow">
          {badge}
        </span>
      )}
      <h3 className="font-display text-xl font-bold">{name}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-display text-4xl font-extrabold tracking-tight">{price}</span>
        <span className="text-sm text-muted-foreground">{period}</span>
      </div>
      <ul className="mt-6 flex-1 space-y-2.5 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-7">{cta}</div>
    </div>
  );
}

export function TemplateCard({
  name,
  tag,
  gradient,
  onUse,
}: {
  name: string;
  tag: string;
  gradient?: string;
  onUse?: () => void;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-surface transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-2xl hover:shadow-brand/10">
      <div
        className="aspect-[4/3] w-full"
        style={{
          background:
            gradient ??
            "linear-gradient(135deg, oklch(0.66 0.22 255), oklch(0.62 0.24 295) 55%, oklch(0.72 0.2 45))",
        }}
      />
      <div className="flex items-center justify-between p-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{tag}</p>
          <h3 className="truncate font-display font-semibold">{name}</h3>
        </div>
        <button
          onClick={onUse}
          className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-semibold text-foreground opacity-0 transition group-hover:opacity-100 hover:bg-brand hover:text-primary-foreground"
        >
          Usar →
        </button>
      </div>
    </div>
  );
}

export function ProjectCard({
  name,
  segment,
  status,
  cover,
  onEdit,
}: {
  name: string;
  segment: string;
  status: "Publicado" | "Em edição" | "Rascunho";
  cover?: string;
  onEdit?: () => void;
}) {
  const tone: BadgeTone =
    status === "Publicado" ? "success" : status === "Em edição" ? "brand" : "neutral";
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-white/15">
      <div
        className="aspect-video w-full"
        style={{ background: cover ?? "linear-gradient(135deg, oklch(0.66 0.22 255), oklch(0.62 0.24 295))" }}
      />
      <div className="p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display font-semibold">{name}</h3>
            <p className="text-xs text-muted-foreground">{segment}</p>
          </div>
          <Badge tone={tone}>{status}</Badge>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Atualizado hoje</span>
          <button
            onClick={onEdit}
            className="text-xs font-semibold text-brand hover:underline"
          >
            Editar →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * CREDIT USAGE
 * ============================================================ */

export function CreditUsage({
  used,
  total,
  plan,
  className,
  compact = false,
}: { used: number; total: number; plan?: string; className?: string; compact?: boolean }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  if (compact) {
    return (
      <div className={cn("rounded-xl bg-white/5 p-3 text-xs", className)}>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-semibold">Créditos</span>
          <span className="text-muted-foreground">{used} / {total}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-brand-gradient" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }
  return (
    <div className={cn("rounded-2xl border border-border card-elevated p-6", className)}>
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-white">
          <Coins className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Créditos</p>
          <p className="font-display text-2xl font-bold">{used} <span className="text-sm font-normal text-muted-foreground">/ {total}</span></p>
        </div>
        {plan && (
          <Badge tone="brand" className="ml-auto">
            <Sparkles className="h-3 w-3" /> {plan}
          </Badge>
        )}
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
        <div className="h-full bg-brand-gradient transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {total - used} disponíveis. Renova no próximo ciclo.
      </p>
    </div>
  );
}

/* ============================================================
 * WHATSAPP CTA
 * ============================================================ */

export function WhatsAppCTA({
  message = "Quero ajuda da equipe Publiciart!",
  phone = "5511999999999",
  label = "Falar no WhatsApp",
  className,
}: { message?: string; phone?: string; label?: string; className?: string }) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#25D366]/25 transition hover:opacity-95",
        className,
      )}
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  );
}

/* ============================================================
 * CHAT BUBBLES
 * ============================================================ */

export function AIMessageBubble({
  children,
  name = "Assistente Publiciart",
}: { children: ReactNode; name?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white ring-1 ring-white/15">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path d="M14 9l-3 4h2.2L12 17l3.5-5h-2.2L14 9z" fill="currentColor" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{name}</p>
        <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-surface px-4 py-3 text-sm leading-relaxed text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

export function UserMessageBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-gradient px-4 py-2.5 text-sm leading-relaxed text-white shadow-lg shadow-brand/20">
        {children}
      </div>
    </div>
  );
}
