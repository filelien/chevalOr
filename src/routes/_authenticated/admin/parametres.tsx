import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { fetchAllSiteSettings } from "@/lib/site-settings";
import { HOTEL } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/parametres")({
  component: AdminParametres,
});

function AdminParametres() {
  const { data: settings = [] } = useQuery({
    queryKey: ["site-settings-all"],
    queryFn: fetchAllSiteSettings,
  });

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Configuration"
        title="Paramètres généraux"
        subtitle="Horaires, coordonnées et préférences de l'établissement."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">Établissement</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Téléphone</dt><dd>{HOTEL.phone}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{HOTEL.email}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Check-in</dt><dd>{HOTEL.hours.checkIn}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Check-out</dt><dd>{HOTEL.hours.checkOut}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Restaurant</dt><dd>{HOTEL.hours.restaurant}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">Modifiez les textes publics via Site web (CMS) et SEO.</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">Clés en base (site_settings)</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {settings.length === 0 ? (
              <li className="text-muted-foreground">Aucun paramètre — exécutez la migration Supabase.</li>
            ) : (
              settings.map((s) => (
                <li key={s.key} className="flex justify-between border-b border-border/40 pb-2">
                  <code>{s.key}</code>
                  <span className="text-xs text-muted-foreground">{new Date(s.updated_at).toLocaleDateString("fr-FR")}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-xl">Paiements</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Flooz, T-Money, Visa et Mastercard — intégrez CinetPay ou PayDunya pour les paiements en ligne.
        </p>
      </div>
    </div>
  );
}
