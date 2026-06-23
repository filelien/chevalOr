import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitConferenceRequest } from "@/lib/public-bookings";
import { toast } from "sonner";
import { CONFERENCE } from "@/lib/content";

const EQUIPMENT = CONFERENCE.features.slice(0, 6);

export function ConferenceBookingForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    organizer_name: "",
    organizer_email: "",
    organizer_phone: "",
    event_title: "",
    booking_date: "",
    start_time: "09:00",
    end_time: "17:00",
    participants: 30,
    equipment: [] as string[],
    notes: "",
  });

  function toggleEquipment(item: string) {
    setForm((f) => ({
      ...f,
      equipment: f.equipment.includes(item)
        ? f.equipment.filter((e) => e !== item)
        : [...f.equipment, item],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await submitConferenceRequest(form);
      toast.success("Demande envoyée ! Notre équipe vous contactera sous 24h.");
      setForm({
        organizer_name: "",
        organizer_email: "",
        organizer_phone: "",
        event_title: "",
        booking_date: "",
        start_time: "09:00",
        end_time: "17:00",
        participants: 30,
        equipment: [],
        notes: "",
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6">
      <h3 className="font-display text-xl">Réserver la salle de conférence</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          Nom / Organisation
          <input required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" value={form.organizer_name} onChange={(e) => setForm({ ...form, organizer_name: e.target.value })} />
        </label>
        <label className="block text-sm">
          Email
          <input required type="email" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" value={form.organizer_email} onChange={(e) => setForm({ ...form, organizer_email: e.target.value })} />
        </label>
        <label className="block text-sm">
          Téléphone
          <input required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" value={form.organizer_phone} onChange={(e) => setForm({ ...form, organizer_phone: e.target.value })} />
        </label>
        <label className="block text-sm">
          Titre de l'événement
          <input required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" value={form.event_title} onChange={(e) => setForm({ ...form, event_title: e.target.value })} />
        </label>
        <label className="block text-sm">
          Date
          <input required type="date" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" value={form.booking_date} onChange={(e) => setForm({ ...form, booking_date: e.target.value })} />
        </label>
        <label className="block text-sm">
          Participants
          <input required type="number" min={1} max={80} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" value={form.participants} onChange={(e) => setForm({ ...form, participants: Number(e.target.value) })} />
        </label>
        <label className="block text-sm">
          Début
          <input required type="time" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
        </label>
        <label className="block text-sm">
          Fin
          <input required type="time" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
        </label>
      </div>
      <div>
        <p className="text-sm font-medium">Équipements souhaités</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {EQUIPMENT.map((eq) => (
            <button key={eq} type="button" onClick={() => toggleEquipment(eq)} className={`rounded-full border px-3 py-1 text-xs ${form.equipment.includes(eq) ? "border-gold bg-gold-soft text-gold-deep" : "border-border"}`}>
              {eq}
            </button>
          ))}
        </div>
      </div>
      <label className="block text-sm">
        Notes
        <textarea className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </label>
      <Button type="submit" variant="hero" disabled={loading}>{loading ? "Envoi…" : "Envoyer la demande"}</Button>
    </form>
  );
}
