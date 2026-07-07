import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitEventRequest } from "@/lib/public-bookings";
import { EVENT_TYPES } from "@/lib/events-admin";
import { toast } from "sonner";

type Props = { defaultType?: string; defaultTitle?: string };

export function EventBookingForm({ defaultType = "wedding", defaultTitle = "" }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    event_type: defaultType,
    title: defaultTitle,
    organizer_name: "",
    organizer_email: "",
    organizer_phone: "",
    event_date: "",
    start_time: "",
    end_time: "",
    expected_guests: 50,
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await submitEventRequest(form);
      toast.success("Demande de devis envoyée ! Réponse sous 48h.");
      setForm({
        event_type: defaultType,
        title: "",
        organizer_name: "",
        organizer_email: "",
        organizer_phone: "",
        event_date: "",
        start_time: "",
        end_time: "",
        expected_guests: 50,
        notes: "",
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-border bg-card p-6">
      <h3 className="font-display text-lg">Demander un devis</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          Type d'événement
          <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}>
            {Object.entries(EVENT_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm sm:col-span-2">
          Titre / occasion
          <input required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <label className="block text-sm">
          Nom
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
          Date souhaitée
          <input required type="date" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
        </label>
        <label className="block text-sm">
          Invités estimés
          <input required type="number" min={1} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" value={form.expected_guests} onChange={(e) => setForm({ ...form, expected_guests: Number(e.target.value) })} />
        </label>
      </div>
      <label className="block text-sm">
        Détails
        <textarea className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </label>
      <Button type="submit" variant="hero" disabled={loading}>{loading ? "Envoi…" : "Envoyer"}</Button>
    </form>
  );
}
