import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { ConferenceBookingForm } from "@/components/site/ConferenceBookingForm";
import { EventBookingForm } from "@/components/site/EventBookingForm";
import { EVENTS, CONFERENCE } from "@/lib/content";
import { buildPageMeta } from "@/lib/seo";
import hero from "@/assets/hero.jpg";
import { Check, Presentation } from "lucide-react";

export const Route = createFileRoute("/evenements")({
  head: () => ({
    meta: buildPageMeta({
      title: "Événements & salle de conférence — Cheval d'Or, Anié",
      description: CONFERENCE.subtitle,
      path: "/evenements",
    }),
  }),
  component: EvenementsPage,
});

function EvenementsPage() {
  return (
    <SiteShell>
      <PageHero
        image={hero}
        label="Événements"
        title={CONFERENCE.title}
        subtitle={CONFERENCE.subtitle}
      />
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-xl border border-gold/30 bg-gold-soft/10 p-8 md:p-10">
          <div className="flex items-start gap-4">
            <Presentation className="size-10 shrink-0 text-gold-deep" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gold-deep">{CONFERENCE.capacity}</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {CONFERENCE.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 text-gold-deep" />{f}
                  </li>
                ))}
              </ul>
              <ConferenceBookingForm />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 pb-20 grid gap-8 md:grid-cols-2">
        {EVENTS.map((e) => (
          <div key={e.title} className="rounded-xl border border-border bg-card p-8">
            <span className="text-xs text-gold-deep">{e.capacity}</span>
            <h3 className="mt-2 font-display text-2xl">{e.title}</h3>
            <p className="mt-3 text-muted-foreground">{e.desc}</p>
            <EventBookingForm defaultTitle={e.title} defaultType={e.title.toLowerCase().includes("mariage") ? "wedding" : "reception"} />
          </div>
        ))}
      </section>
    </SiteShell>
  );
}
