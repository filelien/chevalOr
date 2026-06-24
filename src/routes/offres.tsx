import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { useSiteContent } from "@/hooks/use-site-content";
import { useI18n } from "@/lib/i18n";
import { fetchActivePromos } from "@/lib/promo-public";
import { formatXOF } from "@/lib/rooms";
import { buildPageMeta } from "@/lib/seo";
import hero from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";
import { reserverSearch } from "@/lib/reserver-search";

export const Route = createFileRoute("/offres")({
  head: () => ({
    meta: buildPageMeta({
      title: "Offres spéciales — Hôtel Le Cheval d'Or",
      description: "Codes promo et packs séjour exclusifs à l'Hôtel Le Cheval d'Or, Anié.",
      path: "/offres",
    }),
  }),
  component: OffresPage,
});

function OffresPage() {
  const { PACKS } = useSiteContent();
  const { t } = useI18n();
  const u = t.ui.offers;
  const { data: promos = [], isLoading } = useQuery({
    queryKey: ["public-promos"],
    queryFn: fetchActivePromos,
  });

  return (
    <SiteShell>
      <PageHero image={hero} label={t.pages.offers.label} title={u.title} subtitle={u.subtitle} />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="font-display text-3xl">{u.promoTitle}</h2>
        {isLoading ? (
          <p className="mt-6 text-muted-foreground">{u.loading}</p>
        ) : promos.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
            {u.promoEmpty}
          </p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {promos.map((p) => (
              <div key={p.code} className="rounded-xl border-2 border-gold/30 bg-gold-soft/20 p-6">
                <Tag className="size-5 text-gold-deep" />
                <h3 className="mt-3 font-display text-xl">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">-{p.discount_percent}% {u.discountOn}</p>
                <p className="mt-4 font-mono text-lg text-gold-deep">{p.code}</p>
                {p.valid_until && (
                  <p className="text-xs text-muted-foreground">{u.validUntil} {p.valid_until}</p>
                )}
                <Button variant="goldOutline" size="sm" className="mt-4" asChild>
                  <Link to="/reserver" search={reserverSearch({ promo: p.code })}>{u.useCode}</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
        <h2 className="mt-16 font-display text-3xl">{u.packsTitle}</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {PACKS.map((pk) => (
            <div key={pk.id} className="rounded-xl border border-border bg-card p-8 shadow-elegant">
              <span className="rounded-full bg-onyx px-3 py-1 text-xs text-white">{pk.badge}</span>
              <h3 className="mt-4 font-display text-2xl">{pk.name}</h3>
              <p className="mt-2 font-display text-3xl text-gold-deep">{formatXOF(pk.price)}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {pk.includes.map((i) => <li key={i}>✓ {i}</li>)}
              </ul>
              <Button variant="hero" className="mt-6" asChild><Link to="/reserver" search={reserverSearch()}>{u.bookPack}</Link></Button>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
