import { Link } from "@tanstack/react-router";

type LogoProps = {
  className?: string;
  variant?: "default" | "compact";
};

/**
 * Logotipo Publiciart Builder.
 * Marca: ícone abstrato (cursor + raio) + wordmark PUBLICIART com BUILDER em complemento.
 */
export function Logo({ className = "", variant = "default" }: LogoProps) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 font-display ${className}`}>
      <LogoMark className="h-8 w-8" />
      {variant === "default" && (
        <span className="flex items-baseline gap-1.5 leading-none">
          <span className="font-extrabold tracking-tight text-foreground text-[15px] uppercase">
            Publici<span className="text-brand-gradient">art</span>
          </span>
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Builder
          </span>
        </span>
      )}
    </Link>
  );
}

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative grid place-items-center rounded-xl bg-brand-gradient text-white shadow-lg shadow-brand/30 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-1/2 w-1/2">
        {/* Cursor + raio = criação + IA */}
        <path
          d="M4 4l7 16 2.2-6.8L20 11 4 4z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.25"
        />
        <path
          d="M14 9l-3 4h2.2L12 17l3.5-5h-2.2L14 9z"
          fill="currentColor"
        />
      </svg>
      <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
    </span>
  );
}
