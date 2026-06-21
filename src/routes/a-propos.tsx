import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { STORY, HOTEL } from "@/lib/content";
import hero from "@/assets/hero.jpg";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/a-propos")({
  head: () => ({ meta: [{ title: "À propos — Cheval d'Or" }] }),
  component: () => (
    <SiteShell>
      <PageHero image={hero} label="Notre histoire" title="Cheval d'Or depuis 2010" subtitle={STORY.vision} />
      <section className="mx-auto max-w-4xl px-6 py-20">
        {STORY.paragraphs.map((p, i) => (
          <Reveal key={i}><p className="mb-6 text-lg leading-relaxed text-muted-foreground">{p}</p></Reveal>
        ))}
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {STORY.values.map((v) => (
            <div key={v} className="rounded-lg border border-border bg-card p-4 text-center">
              <span className="font-display text-lg text-gold-deep">{v}</span>
            </div>
          ))}
        </div>
        <p className="mt-12 text-center text-sm text-muted-foreground">{HOTEL.address}</p>
      </section>
    </SiteShell>
  ),
});
