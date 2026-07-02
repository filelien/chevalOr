import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  createGuestReservation,
  type GuestReservationInput,
} from "@/lib/guest-reservations";
import { formatXOF } from "@/lib/rooms";
import { Check, AlertCircle, Mail, Phone, MapPin, Calendar } from "lucide-react";

export const Route = createFileRoute("/reserver-sans-compte")({
  component: GuestReservationPage,
  meta: () => [
    { title: "Réserver sans compte — Hôtel Le Cheval d'Or" },
    {
      name: "description",
      content: "Réservez votre chambre sans créer un compte. Procédure simple et sécurisée.",
    },
  ],
});

function GuestReservationPage() {
  const [step, setStep] = useState<"details" | "confirmation" | "success">("details");
  const [loading, setLoading] = useState(false);
  const [bookingRef, setBookingRef] = useState<string>("");

  const [form, setForm] = useState<GuestReservationInput>({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    check_in: "",
    check_out: "",
    room_id: "",
    guests_count: 1,
    special_requests: "",
    agreed_terms: false,
    marketing_consent: false,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["available-rooms"],
    queryFn: async () => {
      const { data } = await supabase
        .from("rooms")
        .select("id, name, type, price_per_night, amenities")
        .eq("status", "available")
        .order("name");
      return data ?? [];
    },
  });

  const calculateNights = () => {
    if (!form.check_in || !form.check_out) return 0;
    const start = new Date(form.check_in);
    const end = new Date(form.check_out);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const selectedRoom = rooms.find((r) => r.id === form.room_id);
  const nights = calculateNights();
  const totalPrice = selectedRoom ? nights * (selectedRoom.price_per_night || 0) : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!form.full_name || !form.email || !form.check_in || !form.check_out || !form.room_id) {
      toast.error("Remplissez tous les champs obligatoires");
      return;
    }

    if (!form.agreed_terms) {
      toast.error("Acceptez les conditions d'utilisation");
      return;
    }

    setStep("confirmation");
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      const result = await createGuestReservation(form);

      if (!result.success) {
        toast.error(result.error || "Erreur lors de la réservation");
        setStep("details");
      } else {
        setBookingRef(result.booking_reference || "");
        setStep("success");
        toast.success("Réservation confirmée!");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur");
      setStep("details");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Réservez votre séjour</h1>
          <p className="text-lg text-slate-600">Sans création de compte - Procédure simple et rapide</p>
        </div>

        {/* Steps Indicator */}
        <div className="flex justify-between mb-8 max-w-md mx-auto">
          {[
            { num: 1, label: "Détails" },
            { num: 2, label: "Confirmation" },
            { num: 3, label: "Succès" },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step === "details" && s.num === 1
                    ? "bg-gold text-white"
                    : step === "confirmation" && s.num <= 2
                      ? "bg-gold text-white"
                      : step === "success"
                        ? "bg-gold text-white"
                        : "bg-slate-200 text-slate-600"
                }`}
              >
                {s.num}
              </div>
              <p className="text-xs text-slate-600 mt-2">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Step 1: Details */}
          {step === "details" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Information Client */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Mail className="size-5 text-gold" />
                  Vos informations
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Nom complet *"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Téléphone"
                    value={form.phone || ""}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                  <input
                    type="text"
                    placeholder="Ville"
                    value={form.city || ""}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>

              {/* Séjour */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="size-5 text-gold" />
                  Dates et chambre
                </h2>

                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  <div>
                    <label className="text-sm font-medium">Check-in *</label>
                    <input
                      type="date"
                      value={form.check_in}
                      onChange={(e) => setForm({ ...form, check_in: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Check-out *</label>
                    <input
                      type="date"
                      value={form.check_out}
                      onChange={(e) => setForm({ ...form, check_out: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Chambre *</label>
                    <select
                      value={form.room_id}
                      onChange={(e) => setForm({ ...form, room_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      required
                    >
                      <option value="">Sélectionner une chambre</option>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} - {formatXOF(r.price_per_night)} / nuit
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nombre de nuits</label>
                    <input
                      type="text"
                      value={nights}
                      disabled
                      className="w-full px-4 py-2 border rounded-lg bg-muted text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* Demandes spéciales */}
              <div>
                <label className="text-sm font-medium">Demandes spéciales</label>
                <textarea
                  placeholder="Ex: Allergies, préférences..."
                  value={form.special_requests || ""}
                  onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                  rows={3}
                />
              </div>

              {/* Prix Total */}
              {selectedRoom && (
                <div className="bg-gold/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{selectedRoom.name}</span>
                    <span>{formatXOF(selectedRoom.price_per_night)} × {nights} nuits</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gold/20">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-gold">{formatXOF(totalPrice)}</span>
                  </div>
                </div>
              )}

              {/* Conditions */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agreed_terms}
                    onChange={(e) => setForm({ ...form, agreed_terms: e.target.checked })}
                    className="size-4"
                    required
                  />
                  <span className="text-sm">
                    J'accepte les{" "}
                    <a href="/cgv" className="text-gold hover:underline">
                      conditions d'utilisation
                    </a>
                    *
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.marketing_consent || false}
                    onChange={(e) => setForm({ ...form, marketing_consent: e.target.checked })}
                    className="size-4"
                  />
                  <span className="text-sm">Recevoir nos offres promotionnelles par email</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => (window.location.href = "/chambres")}
                >
                  Retour
                </Button>
                <Button type="submit" className="flex-1 bg-gold hover:bg-gold/90">
                  Continuer
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Confirmation */}
          {step === "confirmation" && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Confirmer votre réservation</p>
                  <p className="text-sm text-amber-800 mt-1">Vérifiez les informations avant de confirmer.</p>
                </div>
              </div>

              {/* Récapitulatif */}
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <p className="text-sm text-slate-600">Client</p>
                  <p className="font-semibold">{form.full_name}</p>
                  <p className="text-sm text-slate-600">{form.email}</p>
                </div>

                <div className="border-b pb-4">
                  <p className="text-sm text-slate-600">Séjour</p>
                  <p className="font-semibold">{selectedRoom?.name}</p>
                  <p className="text-sm text-slate-600">
                    {new Date(form.check_in).toLocaleDateString("fr-FR")} →{" "}
                    {new Date(form.check_out).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="text-sm text-slate-600">{nights} nuit(s)</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Montant</p>
                  <p className="text-3xl font-bold text-gold">{formatXOF(totalPrice)}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep("details")} disabled={loading}>
                  Modifier
                </Button>
                <Button
                  className="flex-1 bg-gold hover:bg-gold/90"
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading ? "Traitement..." : "Confirmer la réservation"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-green-100 rounded-full p-4">
                  <Check className="size-12 text-green-600" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Réservation confirmée!</h2>
                <p className="text-slate-600">Un email de confirmation a été envoyé à {form.email}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-6">
                <p className="text-sm text-slate-600">Votre numéro de réservation</p>
                <p className="text-2xl font-mono font-bold text-gold mt-2">{bookingRef}</p>
                <p className="text-sm text-slate-600 mt-4">Conservez ce numéro pour vos correspondances</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  Vous recevrez les détails du paiement et les modalités d'arrivée par email.
                </p>
              </div>

              <Button className="w-full bg-gold hover:bg-gold/90" onClick={() => (window.location.href = "/")}>
                Retour à l'accueil
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
