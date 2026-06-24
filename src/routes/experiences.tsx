import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { useSiteContent } from "@/hooks/use-site-content";
import { useI18n } from "@/lib/i18n";
import hero from "@/assets/hero.jpg";
import restaurantImg from "@/assets/restaurant.jpg";
import roomImg from "@/assets/room-deluxe.jpg";
import { Button } from "@/components/ui/button";

const imgs: Record<string, string> = { hero, restaurant: restaurantImg, room: roomImg };

export const Route = createFileRoute("/experiences")({
  head: () => ({ meta: [{ title: "Expériences — Cheval d'Or" }] }),
  component: ExperiencesPage,
});

function ExperiencesPage() {
  const { EXPERIENCES } = useSiteContent();
  const { t } = useI18n();
  const u = t.ui.experiences;

  return (
    <SiteShell>
      <PageHero image={hero} label={t.pages.experiences.label} title={u.title} subtitle={u.subtitle} />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {EXPERIENCES.map((e) => (
            <Reveal key={e.title}>
              <div className="overflow-hidden rounded-xl bg-card shadow-elegant">
                <img src={imgs[e.image]} alt="" className="aspect-[16/10] w-full object-cover" />
                <div className="p-6">
                  <span className="text-xs text-gold-deep">{e.duration}</span>
                  <h3 className="mt-1 font-display text-2xl">{e.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{e.desc}</p>
                  <p className="mt-4 font-display text-xl text-gold-deep">{e.price}</p>
                  <Button variant="goldOutline" className="mt-4" asChild>
                    <Link to="/contact">{u.book}</Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
