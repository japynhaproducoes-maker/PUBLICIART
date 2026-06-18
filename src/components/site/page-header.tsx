export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-widest text-brand">{eyebrow}</span>
        )}
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{subtitle}</p>}
      </div>
    </section>
  );
}
