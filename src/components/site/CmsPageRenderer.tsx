import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type CmsPage, getVisibleCmsSections } from "@/lib/cms-pages";
import { PageHero } from "@/components/site/PageHero";
import hero from "@/assets/hero.jpg";

export function CmsPageRenderer({ page }: { page: CmsPage | null }) {
  if (!page) return null;

  const sections = getVisibleCmsSections(page);

  return (
    <div className="space-y-8 pb-20">
      {sections.filter((section) => section.type === "hero").map((section) => (
        <PageHero
          key={section.id}
          image={section.image || hero}
          label={page.title}
          title={section.title || page.title}
          subtitle={section.body}
        >
          {section.ctaLabel && section.ctaHref ? (
            <Button variant="hero" className="mt-6" asChild>
              <Link to={section.ctaHref}>{section.ctaLabel}<ArrowRight className="ml-2 size-4" /></Link>
            </Button>
          ) : null}
        </PageHero>
      ))}

      {sections.filter((section) => section.type !== "hero").map((section) => {
        if (section.type === "features") {
          const items = section.body.split("\n").filter(Boolean);
          return (
            <section key={section.id} className="mx-auto max-w-6xl px-6">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                {section.title && <h2 className="font-display text-2xl text-gold-deep">{section.title}</h2>}
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {items.map((item) => (
                    <div key={item} className="rounded-xl border border-border/70 bg-background/60 p-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 size-4 text-gold-deep" />
                        <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (section.type === "cta") {
          return (
            <section key={section.id} className="mx-auto max-w-6xl px-6">
              <div className="rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/10 to-transparent p-8">
                {section.title && <h2 className="font-display text-2xl text-gold-deep">{section.title}</h2>}
                <p className="mt-3 max-w-3xl text-muted-foreground">{section.body}</p>
                {section.ctaLabel && section.ctaHref ? (
                  <Button variant="hero" className="mt-6" asChild>
                    <Link to={section.ctaHref}>{section.ctaLabel}<ArrowRight className="ml-2 size-4" /></Link>
                  </Button>
                ) : null}
              </div>
            </section>
          );
        }

        return (
          <section key={section.id} className="mx-auto max-w-4xl px-6">
            <div className="rounded-2xl border border-border bg-card/80 p-8 shadow-sm">
              {section.title && <h2 className="font-display text-2xl text-gold-deep">{section.title}</h2>}
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground whitespace-pre-line">{section.body}</p>
            </div>
          </section>
        );
      })}

      {sections.length === 0 && (
        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-2xl border border-dashed border-border bg-card/70 p-10 text-center">
            <Sparkles className="mx-auto size-7 text-gold-deep" />
            <h2 className="mt-4 font-display text-2xl">{page.title}</h2>
            <p className="mt-3 text-muted-foreground">{page.description || "Cette page sera enrichie depuis l’administration du site."}</p>
          </div>
        </section>
      )}
    </div>
  );
}
