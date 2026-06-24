import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { useSiteContent } from "@/hooks/use-site-content";
import { useI18n } from "@/lib/i18n";
import hero from "@/assets/hero.jpg";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — Cheval d'Or" }] }),
  component: FaqPage,
});

function FaqPage() {
  const { FAQ } = useSiteContent();
  const { t } = useI18n();
  const p = t.pages.faq;
  return (
    <SiteShell>
      <PageHero image={hero} label={p.label} title={p.title} subtitle={p.subtitle} />
      <section className="mx-auto max-w-3xl px-6 py-20">
        <Accordion type="single" collapsible className="space-y-2">
          {FAQ.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="rounded-xl border border-border bg-card px-4 shadow-sm">
              <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SiteShell>
  );
}
