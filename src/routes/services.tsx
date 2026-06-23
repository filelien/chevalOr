import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { SERVICES } from "@/lib/content";
import hero from "@/assets/hero.jpg";
import {
  Wifi, Sparkles, Coffee, Car, Bell, UtensilsCrossed, Briefcase, Shirt, BedDouble,
} from "lucide-react";

const ICONS: Record<string, typeof Wifi> = {
  wifi: Wifi,
  sparkles: Sparkles,
  coffee: Coffee,
  car: Car,
  bell: Bell,
  utensils: UtensilsCrossed,
  briefcase: Briefcase,
  shirt: Shirt,
  bed: BedDouble,
};

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Nos services — Cheval d'Or, Anié" },
      { name: "description", content: "Chambres climatisées, Wi-Fi, restaurant, salle de conférence, parking sécurisé et accueil 24h/24 à Anié." },
    ],
  }),
  component: () => (
    <SiteShell>
      <PageHero
        image={hero}
        label="Services"
        title="Nos services"
        subtitle="Confort, sécurité et équipements modernes pour vos séjours professionnels et touristiques à Anié."
      />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => {
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
