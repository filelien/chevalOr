import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HOTEL } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/whatsapp")({
  component: WhatsappPage,
});

function WhatsappPage() {
  const wa = `https://wa.me/${HOTEL.whatsapp}`;
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Marketing"
        title="WhatsApp Business"
        subtitle="Messages automatiques de confirmation et rappels — intégration API à venir."
      />
      <div className="rounded-xl border border-border bg-card p-8 space-y-4">
        <p className="text-sm text-muted-foreground">
          Lien WhatsApp actuel du site : <a href={wa} className="text-gold-deep underline" target="_blank" rel="noreferrer">{wa}</a>
        </p>
        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
          <li>Confirmation de réservation</li>
          <li>Rappel J-1 avant arrivée</li>
          <li>Remerciement après séjour</li>
        </ul>
        <p className="text-xs text-muted-foreground">Connectez l'API WhatsApp Business Cloud pour automatiser ces envois.</p>
      </div>
    </div>
  );
}
