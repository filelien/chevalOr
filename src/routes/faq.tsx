import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { FAQ } from "@/lib/content";
import hero from "@/assets/hero.jpg";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — Cheval d'Or" }] }),
  component: () => (
    <SiteShell>
      <PageHero image={hero} label="FAQ" title="Questions fréquentes" subtitle="Tout ce qu'il faut savoir avant votre séjour." />
      <section className="mx-auto max-w-3xl px-6 py-20">
        <Accordion type="single" collapsible className="space-y-2">
          {FAQ.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="rounded-lg border border-border bg-card px-4">
              <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SiteShell>
  ),
});
