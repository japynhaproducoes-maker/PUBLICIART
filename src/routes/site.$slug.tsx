import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Phone, MapPin, Star, Instagram, Sparkles, ArrowLeft } from "lucide-react";
import { sitesApi, sectionsApi, projectsApi } from "@/lib/api";
import { store } from "@/lib/data/store";
import { planCapabilities } from "@/lib/plan-capabilities";
import type { Site, GeneratedSection } from "@/lib/types";

export const Route = createFileRoute("/site/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — site publicado` }],
  }),
  component: PublicSitePage,
  notFoundComponent: SiteNotFound,
});

function SiteNotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold">Site não encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esse endereço não está mais no ar ou ainda não foi publicado.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para o Publiciart
        </Link>
      </div>
    </div>
  );
}

function PublicSitePage() {
  const { slug } = Route.useParams();
  const [site, setSite] = useState<Site | null>(null);
  const [sections, setSections] = useState<GeneratedSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [showBadge, setShowBadge] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await sitesApi.getBySlug(slug);
      if (cancelled) return;
      if (!s || s.status !== "published") {
        setMissing(true);
        setLoading(false);
        return;
      }
      const secs = await sectionsApi.listForSite(s.id);
      // Decide visibilidade do badge "Criado com Publiciart" pelo plano do dono
      const project = await projectsApi.get(s.project_id);
      const owner = project ? store.get().users.find((u) => u.id === project.user_id) : null;
      const canRemove = planCapabilities(owner?.plan_id).removeBadge;
      if (cancelled) return;
      setShowBadge(!canRemove);
      setSite(s);
      setSections(secs);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Carregando seu site…
      </div>
    );
  }
  if (missing || !site) return <SiteNotFound />;

  const theme = site.theme_config;
  const isLight = theme.mode === "light";
  const bg = isLight ? "#ffffff" : "#0F1115";
  const fg = isLight ? "#0F1115" : "#fff";
  const muted = isLight ? "#F7F7F5" : "rgba(255,255,255,0.04)";
  const accent = theme.accent;

  return (
    <div style={{ background: bg, color: fg, fontFamily: `${theme.font}, system-ui` }}>
      <main className="mx-auto max-w-3xl">
        {sections.map((sec) => {
          if (sec.type === "hero") {
            const subtitle = (sec.config?.subtitle as string) ?? sec.content;
            const cta = (sec.config?.cta as string) ?? "Falar com a gente";
            return (
              <section key={sec.id} className="px-6 py-14 sm:px-10 sm:py-20" style={{ background: muted }}>
                <p className="text-xs uppercase tracking-widest opacity-60">{site.title}</p>
                <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-5xl">
                  {sec.title}
                </h1>
                <p className="mt-3 max-w-xl text-base opacity-75">{subtitle}</p>
                <button
                  className="mt-6 rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-lg"
                  style={{ background: accent }}
                >
                  {cta}
                </button>
              </section>
            );
          }
          if (sec.type === "about") {
            return (
              <Block key={sec.id} title={sec.title} accent={accent}>
                <p className="text-sm opacity-80 sm:text-base">{sec.content}</p>
              </Block>
            );
          }
          if (sec.type === "services") {
            const items = (sec.config?.items as string[]) ?? [];
            return (
              <Block key={sec.id} title={sec.title} accent={accent}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((it, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl p-4"
                      style={{ background: muted }}
                    >
                      <p className="text-sm font-semibold">{it}</p>
                      <p className="mt-1 text-xs opacity-60">Saiba mais ao entrar em contato.</p>
                    </div>
                  ))}
                </div>
              </Block>
            );
          }
          if (sec.type === "testimonials") {
            const items =
              (sec.config?.items as { name: string; text: string; stars: number }[]) ?? [];
            return (
              <Block key={sec.id} title={sec.title} accent={accent}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((t, idx) => (
                    <div key={idx} className="rounded-xl p-4" style={{ background: muted }}>
                      <div className="mb-1 flex gap-0.5 text-amber-400">
                        {Array.from({ length: t.stars }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-sm opacity-85">"{t.text}"</p>
                      <p className="mt-1 text-xs opacity-50">— {t.name}</p>
                    </div>
                  ))}
                </div>
              </Block>
            );
          }
          if (sec.type === "faq") {
            const items = (sec.config?.items as { q: string; a: string }[]) ?? [];
            return (
              <Block key={sec.id} title={sec.title} accent={accent}>
                <div className="space-y-3">
                  {items.map((it, idx) => (
                    <details key={idx} className="rounded-xl p-4" style={{ background: muted }}>
                      <summary className="cursor-pointer text-sm font-semibold">{it.q}</summary>
                      <p className="mt-2 text-sm opacity-75">{it.a}</p>
                    </details>
                  ))}
                </div>
              </Block>
            );
          }
          if (sec.type === "cta") {
            const wa = (sec.config?.whatsapp as string) ?? "";
            const href = wa
              ? `https://wa.me/${wa.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Vim pelo site.")}`
              : "#";
            return (
              <section
                key={sec.id}
                className="px-6 py-12 text-center sm:px-10"
                style={{ background: accent, color: "#fff" }}
              >
                <h2 className="font-display text-2xl font-bold sm:text-3xl">{sec.title}</h2>
                <p className="mt-2 opacity-90">{sec.content}</p>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold"
                  style={{ color: accent }}
                >
                  <Phone className="h-4 w-4" />
                  {wa || "Fale conosco"}
                </a>
              </section>
            );
          }
          if (sec.type === "contact") {
            const wa = (sec.config?.whatsapp as string) ?? "";
            const ig = (sec.config?.instagram as string) ?? "";
            const city = (sec.config?.city as string) ?? "";
            return (
              <Block key={sec.id} title={sec.title} accent={accent}>
                <div className="space-y-2 text-sm opacity-80">
                  {city && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> {city}
                    </p>
                  )}
                  {wa && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" /> {wa}
                    </p>
                  )}
                  {ig && (
                    <p className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" /> {ig}
                    </p>
                  )}
                </div>
              </Block>
            );
          }
          return (
            <Block key={sec.id} title={sec.title} accent={accent}>
              <p className="text-sm opacity-75">{sec.content}</p>
            </Block>
          );
        })}

        <footer className="px-6 py-8 text-center text-xs opacity-50 sm:px-10">
          © {new Date().getFullYear()} {site.title}
          {showBadge && (
            <>
              {" "}·{" "}
              <Link to="/" className="underline">
                Criado com Publiciart Builder
              </Link>
            </>
          )}
        </footer>
      </main>

      {showBadge && (
        <Link
          to="/"
          className="fixed bottom-3 right-3 z-50 inline-flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur hover:bg-black"
        >
          <Sparkles className="h-3 w-3" /> Criado com Publiciart
        </Link>
      )}
    </div>
  );
}

function Block({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-white/5 px-6 py-10 sm:px-10 sm:py-14">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
        <p className="text-[11px] font-semibold uppercase tracking-widest opacity-70">{title}</p>
      </div>
      {children}
    </section>
  );
}

// Silence unused import
void notFound;
