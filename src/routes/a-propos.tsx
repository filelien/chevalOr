import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { useSiteContent } from "@/hooks/use-site-content";
import { useI18n } from "@/lib/i18n";
import hero from "@/assets/hero.jpg";
import { Reveal } from "@/components/site/Reveal";
import { Check } from "lucide-react";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — Hôtel Le Cheval d'Or, Anié" },
      { name: "description", content: "Hôtel de référence à Anié, Togo — hospitalité, confort et excellence." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { STORY, HOTEL, WHY_CHOOSE, ANIE } = useSiteContent();
  const { t } = useI18n();

  return (
    <SiteShell>
      <PageHero
        image={hero}
        label={t.ui.about.presentation}
        title={HOTEL.name}
        subtitle={HOTEL.tagline}
      />
      <section className="mx-auto max-w-4xl px-6 py-20">
        <p className="text-center font-display text-xl text-gold-deep">{HOTEL.slogan}</p>
        {STORY.paragraphs.map((p, i) => (
          <Reveal key={i}>
            <p className="mb-6 mt-8 text-lg leading-relaxed text-muted-foreground">{p}</p>
          </Reveal>
        ))}
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {STORY.values.map((v) => (
            <div key={v} className="rounded-lg border border-border bg-card p-4 text-center">
              <span className="font-display text-lg text-gold-deep">{v}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/30 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center font-display text-3xl">{WHY_CHOOSE.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">{WHY_CHOOSE.subtitle}</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {WHY_CHOOSE.reasons.map((r) => (
              <Reveal key={r.title}>
                <div className="flex gap-4 rounded-xl border border-border bg-card p-6">
                  <Check className="size-6 shrink-0 text-gold-deep" />
                  <div>
                    <h3 className="font-display text-xl">{r.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="font-display text-3xl">{ANIE.title}</h2>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{ANIE.intro}</p>
        <ul className="mt-8 space-y-3">
          {ANIE.highlights.map((h) => (
            <li key={h} className="flex gap-3 text-muted-foreground">
              <Check className="size-5 shrink-0 text-gold-deep" />{h}
            </li>
          ))}
        </ul>
        <p className="mt-12 text-center text-sm text-muted-foreground">{HOTEL.address}</p>
      </section>
    </SiteShell>
  );
}
