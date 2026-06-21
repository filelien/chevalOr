import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { SERVICES } from "@/lib/content";
import hero from "@/assets/hero.jpg";
import { Wifi, Waves, Sparkles, Coffee, Car, Bell, UtensilsCrossed, ShieldCheck, Briefcase, Shirt, Plane, Baby } from "lucide-react";

const ICONS: Record<string, typeof Wifi> = {
  wifi: Wifi, waves: Waves, sparkles: Sparkles, coffee: Coffee, car: Car,
  bell: Bell, utensils: UtensilsCrossed, shield: ShieldCheck, briefcase: Briefcase,
  shirt: Shirt, plane: Plane, baby: Baby,
};

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [{ title: "Services & équipements — Cheval d'Or" }] }),
  component: () => (
    <SiteShell>
      <PageHero image={hero} label="Services" title="Confort & excellence" subtitle="Chaque détail pensé comme dans les plus grands hôtels internationaux." />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = ICONS[s.icon] ?? Sparkles;
            return (
              <Reveal key={s.id}>
                <div className="rounded-xl border border-border bg-card p-6 shadow-elegant transition hover:-translate-y-1">
                  <Icon className="size-8 text-gold-deep" />
                  <h3 className="mt-4 font-display text-xl">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </SiteShell>
  ),
});
