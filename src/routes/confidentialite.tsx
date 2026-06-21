import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";

export const Route = createFileRoute("/confidentialite")({
  component: () => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-display text-4xl">Politique de confidentialité</h1>
        <div className="mt-8 space-y-4 text-muted-foreground">
          <p>L'Hôtel Le Cheval d'Or collecte uniquement les données nécessaires à la gestion de vos réservations et à la relation client.</p>
          <h2 className="font-display text-xl text-foreground">Données collectées</h2>
          <p>Nom, email, téléphone, historique de séjour, préférences — stockés de manière sécurisée (Supabase, chiffrement TLS).</p>
          <h2 className="font-display text-xl text-foreground">Vos droits</h2>
          <p>Vous pouvez demander l'accès, la rectification ou la suppression de vos données en contactant reservation@chevaldor.tg.</p>
        </div>
      </div>
    </SiteShell>
  ),
});
