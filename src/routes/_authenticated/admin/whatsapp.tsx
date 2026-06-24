import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, StatCard } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { HOTEL } from "@/lib/content";
import { getSiteSetting } from "@/lib/site-settings";
import { MessageCircle, Send, Clock, CheckCircle2, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/whatsapp")({
  component: WhatsappPage,
});

const TEMPLATES = [
  { id: "confirm", title: "Confirmation réservation", preview: "Bonjour {nom}, votre réservation {ref} est confirmée. Arrivée : {date}. Hôtel Le Cheval d'Or." },
  { id: "reminder", title: "Rappel J-1", preview: "Bonjour {nom}, nous vous attendons demain à l'Hôtel Le Cheval d'Or. Check-in à partir de 14h." },
  { id: "thanks", title: "Remerciement", preview: "Merci {nom} pour votre séjour ! Nous espérons vous revoir bientôt au Cheval d'Or." },
];

function WhatsappPage() {
  const wa = `https://wa.me/${HOTEL.whatsapp}`;
  const { data: apiStatus } = useQuery({
    queryKey: ["whatsapp-config"],
    queryFn: () => getSiteSetting<{ enabled?: boolean }>("whatsapp_config", { enabled: false }),
  });

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Marketing · Messagerie"
        title="WhatsApp Business"
        subtitle="Modèles de messages, lien direct clients et préparation API Cloud."
      >
        <Button variant="hero" size="sm" asChild>
          <a href={wa} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-1 size-4" />Ouvrir WhatsApp
          </a>
        </Button>
      </AdminPageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Numéro actif" value={`+${HOTEL.whatsapp}`} Icon={MessageCircle} accent />
        <StatCard label="API Cloud" value={apiStatus?.enabled ? "Connectée" : "Manuelle"} Icon={Send} />
        <StatCard label="Modèles prêts" value={TEMPLATES.length} Icon={CheckCircle2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-xl">Lien client direct</h2>
          <p className="mt-2 text-sm text-muted-foreground">Utilisé sur le site public pour contacter la réception.</p>
          <code className="mt-4 block rounded-lg bg-secondary/50 p-4 text-sm break-all">{wa}</code>
          <Button className="mt-4" variant="outline" size="sm" asChild>
            <a href={wa} target="_blank" rel="noreferrer">Tester le lien</a>
          </Button>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-3">
            <Clock className="size-6 shrink-0 text-emerald-700" />
            <div>
              <h3 className="font-medium text-emerald-900">Automatisation API</h3>
              <p className="mt-2 text-sm text-emerald-800">
                Connectez WhatsApp Business Cloud (Meta) pour envoyer confirmations et rappels automatiques après chaque réservation.
              </p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link to="/admin/parametres">Configurer dans Paramètres</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl">Modèles de messages</h2>
        <p className="mt-1 text-sm text-muted-foreground">Copiez et personnalisez avant envoi manuel ou automatisation.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {TEMPLATES.map((t) => (
            <div key={t.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="font-medium">{t.title}</h3>
              <p className="mt-3 rounded-lg bg-secondary/40 p-3 text-sm text-muted-foreground">{t.preview}</p>
              <Button size="sm" variant="outline" className="mt-4" onClick={() => {
                navigator.clipboard.writeText(t.preview);
              }}>Copier le modèle</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
