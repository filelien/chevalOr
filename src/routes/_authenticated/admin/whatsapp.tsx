import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader, StatCard } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { HOTEL } from "@/lib/content";
import { getSiteSetting, setSiteSetting } from "@/lib/site-settings";
import { buildWhatsAppUrl, formatWhatsAppPhone, normalizeWhatsAppPhone } from "@/lib/whatsapp-utils";
import { MessageCircle, Send, Clock, CheckCircle2, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/whatsapp")({
  component: WhatsappPage,
});

type WhatsAppConfig = {
  enabled?: boolean;
  phone?: string;
  defaultMessage?: string;
  activeHours?: string;
  agent?: string;
  color?: string;
  position?: "left" | "right";
  icon?: string;
};

const TEMPLATES = [
  { id: "confirm", title: "Confirmation réservation", preview: "Bonjour {nom}, votre réservation {ref} est confirmée. Arrivée : {date}. Hôtel Le Cheval d'Or." },
  { id: "reminder", title: "Rappel J-1", preview: "Bonjour {nom}, nous vous attendons demain à l'Hôtel Le Cheval d'Or. Check-in à partir de 14h." },
  { id: "thanks", title: "Remerciement", preview: "Merci {nom} pour votre séjour ! Nous espérons vous revoir bientôt au Cheval d'Or." },
];

const DEFAULT_CONFIG: WhatsAppConfig = {
  enabled: true,
  phone: HOTEL.whatsapp,
  defaultMessage: "Bonjour, je souhaite réserver une chambre ou obtenir des informations.",
  activeHours: "08:00 - 20:00",
  agent: "Réception",
  color: "#25D366",
  position: "right",
  icon: "message-circle",
};

function WhatsappPage() {
  const qc = useQueryClient();
  const { data: apiStatus } = useQuery({
    queryKey: ["whatsapp-config"],
    queryFn: () => getSiteSetting<WhatsAppConfig>("whatsapp_config", DEFAULT_CONFIG),
  });
  const [config, setConfig] = useState<WhatsAppConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    if (apiStatus) {
      setConfig({
        ...DEFAULT_CONFIG,
        ...apiStatus,
        phone: formatWhatsAppPhone(apiStatus.phone || HOTEL.whatsapp),
      });
    }
  }, [apiStatus]);

  async function saveConfig() {
    const normalized = {
      ...config,
      phone: normalizeWhatsAppPhone(config.phone || HOTEL.whatsapp),
    };
    await setSiteSetting("whatsapp_config", normalized);
    setConfig({ ...normalized, phone: formatWhatsAppPhone(normalized.phone) });
    toast.success("Configuration WhatsApp enregistrée");
    qc.invalidateQueries({ queryKey: ["whatsapp-config"] });
    qc.invalidateQueries({ queryKey: ["whatsapp-button"] });
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Marketing · Messagerie"
        title="WhatsApp Business"
        subtitle="Centre de gestion du bouton flottant, des messages contextuels et des modèles d’envoi."
      >
        <Button variant="hero" size="sm" asChild>
          <a href={buildWhatsAppUrl(normalizeWhatsAppPhone(config.phone || HOTEL.whatsapp), config.defaultMessage)} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-1 size-4" />Ouvrir WhatsApp
          </a>
        </Button>
      </AdminPageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Numéro actif" value={`+${config.phone || HOTEL.whatsapp}`} Icon={MessageCircle} accent />
        <StatCard label="État" value={config.enabled ? "Actif" : "Désactivé"} Icon={Send} />
        <StatCard label="Modèles prêts" value={TEMPLATES.length} Icon={CheckCircle2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-xl">Centre WhatsApp</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-muted-foreground">Numéro</span>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={config.phone || ""} onChange={(e) => setConfig({ ...config, phone: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">Agent / réception</span>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={config.agent || ""} onChange={(e) => setConfig({ ...config, agent: e.target.value })} />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="text-muted-foreground">Message par défaut</span>
              <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={3} value={config.defaultMessage || ""} onChange={(e) => setConfig({ ...config, defaultMessage: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">Horaires</span>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={config.activeHours || ""} onChange={(e) => setConfig({ ...config, activeHours: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">Position</span>
              <select className="mt-1 w-full rounded-md border px-3 py-2" value={config.position || "right"} onChange={(e) => setConfig({ ...config, position: e.target.value as "left" | "right" })}>
                <option value="right">Droite</option>
                <option value="left">Gauche</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">Couleur</span>
              <input type="color" className="mt-1 h-10 w-full rounded-md border" value={config.color || "#25D366"} onChange={(e) => setConfig({ ...config, color: e.target.value })} />
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={config.enabled ?? true} onChange={(e) => setConfig({ ...config, enabled: e.target.checked })} />
              Activer le bouton sur le site
            </label>
          </div>
          <Button className="mt-4" variant="hero" onClick={() => void saveConfig()}>Enregistrer</Button>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-3">
            <Clock className="size-6 shrink-0 text-emerald-700" />
            <div>
              <h3 className="font-medium text-emerald-900">WhatsApp Business premium</h3>
              <p className="mt-2 text-sm text-emerald-800">
                Le bouton flottant est désormais configurable depuis l’admin, avec message par défaut, position, couleur, activation et gestion de l’agent de réception.
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
