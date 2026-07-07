import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { downloadCsv } from "@/lib/export-csv";
import { toast } from "sonner";
import { Mail, Newspaper, UtensilsCrossed, Download, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: AdminMessages,
});

type Tab = "contact" | "newsletter" | "tables";

const TABLE_STATUS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};

function AdminMessages() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("contact");

  const { data: contacts, isLoading: loadingContact } = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: subscribers, isLoading: loadingNews } = useQuery({
    queryKey: ["admin-newsletter"],
    queryFn: async () => {
      const { data, error } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: tableRes, isLoading: loadingTables } = useQuery({
    queryKey: ["admin-table-reservations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("table_reservations").select("*").order("reservation_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function updateTableStatus(id: string, status: "confirmed" | "cancelled" | "completed") {
    const { error } = await supabase.from("table_reservations").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Statut mis à jour");
    qc.invalidateQueries({ queryKey: ["admin-table-reservations"] });
  }

  async function toggleRead(id: string, isRead: boolean) {
    const { error } = await supabase.from("contact_messages").update({ is_read: isRead }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-contact-messages"] });
  }

  const unreadCount = (contacts ?? []).filter((m: any) => !m.is_read).length;

  const tabs: { id: Tab; label: string; Icon: typeof Mail; count: number }[] = [
    { id: "contact", label: "Messages contact", Icon: Mail, count: unreadCount || (contacts?.length ?? 0) },
    { id: "newsletter", label: "Newsletter", Icon: Newspaper, count: subscribers?.length ?? 0 },
    { id: "tables", label: "Réservations table", Icon: UtensilsCrossed, count: tableRes?.length ?? 0 },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminPageHeader
        label="Inbox · CRM"
        title="Messages & demandes"
        subtitle="Formulaires contact, abonnés newsletter et réservations restaurant."
      >
        {tab === "newsletter" && (subscribers?.length ?? 0) > 0 && (
          <Button variant="outline" size="sm" onClick={() => downloadCsv(
            `newsletter-${new Date().toISOString().slice(0, 10)}.csv`,
            ["Email", "Inscription"],
            (subscribers ?? []).map((s: any) => [s.email, s.created_at]),
          )}>
            <Download className="mr-1 size-4" />Exporter abonnés
          </Button>
        )}
      </AdminPageHeader>

      <div className="flex flex-wrap gap-2 border-b border-border pb-1">
        {tabs.map(({ id, label, Icon, count }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-medium transition ${tab === id ? "border-b-2 border-gold-deep text-gold-deep bg-gold-soft/20" : "text-muted-foreground hover:text-foreground"}`}>
            <Icon className="size-4" />
            {label}
            <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold-deep">{count}</span>
          </button>
        ))}
      </div>

      {tab === "contact" && (
        <div className="mt-6 space-y-4">
          {loadingContact ? <p className="text-muted-foreground">Chargement…</p> : (contacts?.length ?? 0) === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">Aucun message.</p>
          ) : contacts!.map((m: any) => (
            <div key={m.id} className={`rounded-xl border bg-card p-6 ${m.is_read ? "border-border" : "border-gold/40 bg-gold-soft/10"}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{m.full_name}</p>
                  <p className="text-sm text-muted-foreground">{m.email}{m.phone ? ` · ${m.phone}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("fr-FR")}</p>
                  <Button size="sm" variant="ghost" title={m.is_read ? "Marquer non lu" : "Marquer lu"}
                    onClick={() => toggleRead(m.id, !m.is_read)}>
                    <Check className={`size-4 ${m.is_read ? "text-muted-foreground" : "text-emerald-600"}`} />
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-sm font-medium text-gold-deep">{m.subject}</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">{m.message}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "newsletter" && (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="audit-table w-full text-sm">
            <thead className="bg-[#f8f6f1] text-left text-[11px] font-bold uppercase tracking-widest text-foreground/70">
              <tr><th className="px-4 py-3">Email</th><th className="px-4 py-3">Inscription</th></tr>
            </thead>
            <tbody>
              {loadingNews ? (
                <tr><td colSpan={2} className="p-8 text-center text-muted-foreground">Chargement…</td></tr>
              ) : (subscribers?.length ?? 0) === 0 ? (
                <tr><td colSpan={2} className="p-8 text-center text-muted-foreground">Aucun abonné.</td></tr>
              ) : subscribers!.map((s) => (
                <tr key={s.id} className="border-t border-border/60">
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "tables" && (
        <div className="mt-6 space-y-4">
          {loadingTables ? <p className="text-muted-foreground">Chargement…</p> : (tableRes?.length ?? 0) === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">Aucune réservation table.</p>
          ) : tableRes!.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Réf. {r.reference}</p>
                  <p className="mt-1 font-display text-xl">{r.full_name}</p>
                  <p className="text-sm text-muted-foreground">{r.email}{r.phone ? ` · ${r.phone}` : ""}</p>
                  <p className="mt-2 text-sm">
                    {new Date(r.reservation_date).toLocaleDateString("fr-FR")} à {r.reservation_time.slice(0, 5)} · {r.guests_count} couverts
                  </p>
                  {r.notes && <p className="mt-2 text-sm italic text-muted-foreground">{r.notes}</p>}
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs">{TABLE_STATUS[r.status] ?? r.status}</span>
                  {r.status === "pending" && (
                    <div className="mt-3 flex flex-wrap gap-2 justify-end">
                      <Button size="sm" onClick={() => updateTableStatus(r.id, "confirmed")}>Confirmer</Button>
                      <Button size="sm" variant="outline" onClick={() => updateTableStatus(r.id, "cancelled")}>Annuler</Button>
                    </div>
                  )}
                  {r.status === "confirmed" && (
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => updateTableStatus(r.id, "completed")}>Terminer</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
