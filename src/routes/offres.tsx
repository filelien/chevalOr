import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { PROMOTIONS, PACKS } from "@/lib/content";
import { formatXOF } from "@/lib/rooms";
import hero from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";

export const Route = createFileRoute("/offres")({
  head: () => ({ meta: [{ title: "Offres spéciales — Cheval d'Or" }] }),
  component: () => (
    <SiteShell>
      <PageHero image={hero} label="Offres" title="Promotions & packs séjour" subtitle="Des formules exclusives pour chaque type de voyage." />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="font-display text-3xl">Codes promo</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PROMOTIONS.map((p) => (
            <div key={p.code} className="rounded-xl border-2 border-gold/30 bg-gold-soft/20 p-6">
              <Tag className="size-5 text-gold-deep" />
              <h3 className="mt-3 font-display text-xl">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              <p className="mt-4 font-mono text-lg text-gold-deep">{p.code}</p>
              <p className="text-xs text-muted-foreground">Valable jusqu'au {p.until}</p>
            </div>
          ))}
        </div>
        <h2 className="mt-16 font-display text-3xl">Packs séjour</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {PACKS.map((pk) => (
            <div key={pk.id} className="rounded-xl border border-border bg-card p-8 shadow-elegant">
              <span className="rounded-full bg-onyx px-3 py-1 text-xs text-white">{pk.badge}</span>
              <h3 className="mt-4 font-display text-2xl">{pk.name}</h3>
              <p className="mt-2 font-display text-3xl text-gold-deep">{formatXOF(pk.price)}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {pk.includes.map((i) => <li key={i}>✓ {i}</li>)}
              </ul>
              <Button variant="hero" className="mt-6" asChild><Link to="/reserver">Réserver ce pack</Link></Button>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  ),
});
