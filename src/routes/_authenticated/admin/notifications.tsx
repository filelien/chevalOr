import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/notifications-admin";
import { Bell, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/notifications")({
  component: AdminNotifications,
});

const TYPE_LABEL: Record<string, string> = {
  reservation: "Réservation",
  payment: "Paiement",
  message: "Message",
  conference: "Conférence",
  cancellation: "Annulation",
};

function AdminNotifications() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30_000,
  });

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader label="Alertes" title="Notifications" subtitle="Réservations, paiements, messages et événements en temps réel.">
        <Button variant="goldOutline" size="sm" onClick={() => markAllNotificationsRead().then(() => qc.invalidateQueries({ queryKey: ["admin-notifications"] }))}>
          <CheckCheck className="mr-1 size-4" />Tout marquer lu
        </Button>
      </AdminPageHeader>

      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        {data.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">Aucune notification.</p>
        ) : (
          data.map((n) => (
            <div key={n.id} className={`flex gap-4 p-4 ${n.is_read ? "opacity-60" : "bg-gold-soft/10"}`}>
              <Bell className="size-5 shrink-0 text-gold-deep mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs uppercase text-gold-deep">{TYPE_LABEL[n.type] ?? n.type}</span>
                  <time className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("fr-FR")}</time>
                </div>
                <p className="mt-1 font-medium">{n.title}</p>
                {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                {n.link && (
                  <Link to={n.link as "/admin"} className="mt-2 inline-block text-sm text-gold-deep underline">
                    Voir détails →
                  </Link>
                )}
              </div>
              {!n.is_read && (
                <Button size="sm" variant="ghost" onClick={() => markNotificationRead(n.id).then(() => qc.invalidateQueries({ queryKey: ["admin-notifications"] }))}>
                  Lu
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Notifications Email, SMS et WhatsApp : configurez les webhooks dans Paramètres (Twilio, WhatsApp Business API).
      </p>
    </div>
  );
}
