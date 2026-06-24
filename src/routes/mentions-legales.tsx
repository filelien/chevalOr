import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { HOTEL } from "@/lib/content";
import { buildPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: buildPageMeta({
      title: "Mentions légales — Cheval d'Or",
      description: "Informations légales de l'Hôtel Le Cheval d'Or, Anié.",
      path: "/mentions-legales",
    }),
  }),
  component: () => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-20 prose prose-neutral">
        <h1 className="font-display text-4xl">Mentions légales</h1>
        <p><strong>Éditeur :</strong> Hôtel Le Cheval d'Or SARL — {HOTEL.address}</p>
        <p><strong>Contact :</strong> {HOTEL.email} · {HOTEL.phone}</p>
        <p><strong>Directeur de publication :</strong> Direction Générale Cheval d'Or</p>
        <p><strong>Hébergement :</strong> Supabase / Lovable Cloud</p>
      </div>
    </SiteShell>
  ),
});
