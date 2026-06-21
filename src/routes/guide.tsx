import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { GUIDE_LOME, HOTEL } from "@/lib/content";
import hero from "@/assets/hero.jpg";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/guide")({
  head: () => ({ meta: [{ title: "Guide Lomé — Cheval d'Or" }] }),
  component: () => (
    <SiteShell>
      <PageHero image={hero} label="Tourisme" title="Guide Lomé & environs" subtitle="Notre conciergerie partage ses adresses favorites." />
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-10 rounded-xl bg-secondary/50 p-6">
          <p className="text-sm"><strong>Météo actuelle :</strong> Lomé, Togo — climat tropical, 28-32°C en saison sèche (novembre-mars).</p>
          <p className="mt-2 text-sm text-muted-foreground">Carte : <a href={`https://maps.google.com/?q=${HOTEL.coords.lat},${HOTEL.coords.lng}`} target="_blank" rel="noopener" className="text-gold-deep underline">Ouvrir Google Maps</a></p>
        </div>
        <div className="space-y-4">
          {GUIDE_LOME.map((g) => (
            <div key={g.name} className="flex gap-4 rounded-xl border border-border bg-card p-5">
              <MapPin className="size-5 shrink-0 text-gold-deep mt-1" />
              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="font-display text-xl">{g.name}</h3>
                  <span className="text-xs text-muted-foreground">{g.dist} de l'hôtel</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  ),
});
