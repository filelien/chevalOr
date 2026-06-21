import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";

export const Route = createFileRoute("/cgv")({
  component: () => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-display text-4xl">Conditions générales de vente</h1>
        <div className="mt-8 space-y-4 text-muted-foreground">
          <p>Les présentes CGV régissent les réservations effectuées sur le site de l'Hôtel Le Cheval d'Or.</p>
          <h2 className="font-display text-xl text-foreground">Réservation</h2>
          <p>Toute réservation est confirmée par email. Un acompte de 30% peut être demandé pour les périodes haute saison.</p>
          <h2 className="font-display text-xl text-foreground">Annulation</h2>
          <p>Annulation gratuite jusqu'à 48h avant l'arrivée. Passé ce délai, la première nuit est due.</p>
          <h2 className="font-display text-xl text-foreground">Paiement</h2>
          <p>Espèces (XOF), carte bancaire, Mobile Money et virement acceptés à l'établissement.</p>
        </div>
      </div>
    </SiteShell>
  ),
});
