import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import {
  fetchConferenceBookings, saveConferenceBooking, setConferenceStatus, deleteConferenceBooking,
  BOOKING_STATUS_LABEL, type ConferenceBooking, type BookingStatus,
} from "@/lib/conference";
import { formatXOF } from "@/lib/rooms";
import { CheckCircle2, XCircle, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/conference")({
  component: AdminConference,
});

const empty: Omit<ConferenceBooking, "id" | "created_at"> = {
  organizer_name: "", organizer_email: "", organizer_phone: "", event_title: "",
  booking_date: new Date().toISOString().slice(0, 10), start_time: "09:00", end_time: "12:00",
  participants: 20, equipment: [], price: 75000, status: "pending", notes: "",
};

function AdminConference() {
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-conference"],
    queryFn: fetchConferenceBookings,
  });

  async function save() {
    try {
      await saveConferenceBooking({ ...form, id: editingId ?? undefined });
      toast.success(editingId ? "Réservation mise à jour" : "Réservation créée");
      setForm(empty);
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ["admin-conference"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Événements professionnels"
        title="Salle de conférence"
        subtitle="Gérez les réservations, disponibilités et tarification de la grande salle."
      />

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-xl">{editingId ? "Modifier" : "Nouvelle réservation"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["organizer_name", "Organisateur", "text"],
            ["organizer_email", "Email", "email"],
            ["organizer_phone", "Téléphone", "tel"],
            ["event_title", "Titre événement", "text"],
            ["booking_date", "Date", "date"],
            ["start_time", "Début", "time"],
            ["end_time", "Fin", "time"],
            ["participants", "Participants", "number"],
            ["price", "Tarif (XOF)", "number"],
          ].map(([key, label, type]) => (
            <label key={key} className="block text-sm">
              <span className="text-muted-foreground">{label}</span>
              <input
                type={type}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                value={String((form as Record<string, unknown>)[key] ?? "")}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    [key]: type === "number" ? Number(e.target.value) : e.target.value,
                  }))
                }
              />
            </label>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="hero" onClick={save}><Plus className="mr-1 size-4" />Enregistrer</Button>
          {editingId && (
            <Button variant="ghost" onClick={() => { setEditingId(null); setForm(empty); }}>Annuler</Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Événement</th>
              <th className="p-4">Organisateur</th>
              <th className="p-4">Participants</th>
              <th className="p-4">Tarif</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Chargement…</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Aucune réservation</td></tr>
            ) : (
              data.map((b) => (
                <tr key={b.id} className="border-b border-border/60 hover:bg-secondary/20">
                  <td className="p-4">{b.booking_date}<br /><span className="text-xs text-muted-foreground">{b.start_time}–{b.end_time}</span></td>
                  <td className="p-4 font-medium">{b.event_title}</td>
                  <td className="p-4">{b.organizer_name}<br /><span className="text-xs text-muted-foreground">{b.organizer_phone}</span></td>
                  <td className="p-4">{b.participants}</td>
                  <td className="p-4">{b.price ? formatXOF(b.price) : "—"}</td>
                  <td className="p-4">{BOOKING_STATUS_LABEL[b.status]}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(b.id); setForm(b); }}>Modifier</Button>
                      {b.status === "pending" && (
                        <Button size="sm" variant="ghost" onClick={() => setConferenceStatus(b.id, "confirmed").then(() => qc.invalidateQueries({ queryKey: ["admin-conference"] }))}>
                          <CheckCircle2 className="size-4 text-green-600" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setConferenceStatus(b.id, "cancelled" as BookingStatus).then(() => qc.invalidateQueries({ queryKey: ["admin-conference"] }))}>
                        <XCircle className="size-4 text-red-500" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteConferenceBooking(b.id).then(() => qc.invalidateQueries({ queryKey: ["admin-conference"] }))}>Suppr.</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
