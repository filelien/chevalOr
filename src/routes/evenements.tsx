import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { EVENTS } from "@/lib/content";
import hero from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/evenements")({
  head: () => ({ meta: [{ title: "Événements — Cheval d'Or" }] }),
  component: () => (
    <SiteShell>
      <PageHero image={hero} label="Événements" title="Mariages, séminaires & célébrations" subtitle="Des espaces d'exception pour vos moments les plus importants." />
      <section className="mx-auto max-w-5xl px-6 py-20 grid gap-8 md:grid-cols-2">
        {EVENTS.map((e) => (
          <div key={e.title} className="rounded-xl border border-border bg-card p-8">
            <span className="text-xs text-gold-deep">{e.capacity}</span>
            <h3 className="mt-2 font-display text-2xl">{e.title}</h3>
            <p className="mt-3 text-muted-foreground">{e.desc}</p>
            <Button variant="goldOutline" className="mt-6" asChild><Link to="/contact">Demander un devis</Link></Button>
          </div>
        ))}
      </section>
    </SiteShell>
  ),
});
