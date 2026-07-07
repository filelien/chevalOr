import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import {
  fetchEventBookings, saveEventBooking, setEventStatus, deleteEventBooking, EVENT_TYPES,
  type EventBooking,
} from "@/lib/events-admin";
import { BOOKING_STATUS_LABEL } from "@/lib/conference";
import { formatXOF } from "@/lib/rooms";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/evenements")({
  component: AdminEvents,
});

const emptyForm = {
  event_type: "seminar", title: "", organizer_name: "", organizer_email: "", organizer_phone: "",
  event_date: new Date().toISOString().slice(0, 10), start_time: "10:00", end_time: "18:00",
  expected_guests: 50, price: null as number | null, status: "pending" as const, notes: "",
};

function AdminEvents() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data = [] } = useQuery({ queryKey: ["admin-events"], queryFn: fetchEventBookings });

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(e: EventBooking) {
    setEditId(e.id);
    setForm({
      event_type: e.event_type,
      title: e.title,
      organizer_name: e.organizer_name,
      organizer_email: e.organizer_email ?? "",
      organizer_phone: e.organizer_phone ?? "",
      event_date: e.event_date,
      start_time: e.start_time ?? "10:00",
      end_time: e.end_time ?? "18:00",
      expected_guests: e.expected_guests,
      price: e.price,
      status: e.status,
      notes: e.notes ?? "",
    });
    setShowForm(true);
  }

  async function save() {
    try {
      await saveEventBooking({ ...form, id: editId ?? undefined });
      toast.success(editId ? "Événement mis à jour" : "Événement enregistré");
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["admin-events"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cet événement ?")) return;
    try {
      await deleteEventBooking(id);
      toast.success("Supprimé");
      qc.invalidateQueries({ queryKey: ["admin-events"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Événements"
        title="Séminaires, mariages & réceptions"
        subtitle="Calendrier et gestion des événements privés et professionnels."
      >
        <Button variant="hero" onClick={openCreate}><Plus className="mr-1 size-4" />Nouvel événement</Button>
      </AdminPageHeader>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Type
            <select className="mt-1 w-full rounded-md border px-3 py-2" value={form.event_type} onChange={(e) => setForm((f) => ({ ...f, event_type: e.target.value }))}>
              {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="text-sm">Titre
            <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </label>
          <label className="text-sm">Organisateur
            <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.organizer_name} onChange={(e) => setForm((f) => ({ ...f, organizer_name: e.target.value }))} />
          </label>
          <label className="text-sm">Email
            <input type="email" className="mt-1 w-full rounded-md border px-3 py-2" value={form.organizer_email} onChange={(e) => setForm((f) => ({ ...f, organizer_email: e.target.value }))} />
          </label>
          <label className="text-sm">Date
            <input type="date" className="mt-1 w-full rounded-md border px-3 py-2" value={form.event_date} onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))} />
          </label>
          <label className="text-sm">Invités prévus
            <input type="number" className="mt-1 w-full rounded-md border px-3 py-2" value={form.expected_guests} onChange={(e) => setForm((f) => ({ ...f, expected_guests: Number(e.target.value) }))} />
          </label>
          <label className="text-sm sm:col-span-2">Notes
            <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </label>
          <div className="flex items-end gap-2 sm:col-span-2">
            <Button variant="hero" onClick={save}>{editId ? "Mettre à jour" : "Enregistrer"}</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {data.map((e) => (
          <div key={e.id} className="rounded-xl border border-border bg-card p-6">
            <span className="text-xs text-gold-deep">{EVENT_TYPES[e.event_type] ?? e.event_type}</span>
            <h3 className="mt-1 font-display text-xl">{e.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{e.event_date} · {e.organizer_name}</p>
            <p className="text-sm">{e.expected_guests} invités · {BOOKING_STATUS_LABEL[e.status]}</p>
            {e.price && <p className="mt-1 text-gold-deep">{formatXOF(e.price)}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="goldOutline" onClick={() => setEventStatus(e.id, "confirmed").then(() => qc.invalidateQueries({ queryKey: ["admin-events"] }))}>Confirmer</Button>
              <Button size="sm" variant="ghost" onClick={() => setEventStatus(e.id, "cancelled").then(() => qc.invalidateQueries({ queryKey: ["admin-events"] }))}>Annuler</Button>
              <Button size="sm" variant="ghost" onClick={() => openEdit(e)}><Pencil className="size-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => remove(e.id)}><Trash2 className="size-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
