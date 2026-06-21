import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { findAvailableRoom } from "@/lib/reservations";
import { formatXOF, ROOM_TYPE_LABEL, type Room } from "@/lib/rooms";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/reserver")({
  head: () => ({
    meta: [
      { title: "Réserver — Hôtel Le Cheval d'Or" },
      { name: "description", content: "Réservez votre chambre en un clic. Nous attribuons automatiquement la chambre disponible la plus adaptée." },
    ],
  }),
  component: ReserverPage,
});

const TYPES: Array<{ value: Room["type"] | ""; label: string }> = [
  { value: "", label: "Tout type" },
  { value: "standard", label: "Standard" },
  { value: "superior", label: "Supérieure" },
  { value: "deluxe", label: "Deluxe" },
  { value: "suite", label: "Suite" },
  { value: "family", label: "Familiale" },
];

function ReserverPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [type, setType] = useState<string>("");
  const [requests, setRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [match, setMatch] = useState<any>(null);

  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setMatch(null);
    if (nights <= 0) { toast.error("Sélectionnez des dates valides"); return; }
    setSubmitting(true);
    try {
      const roomId = await findAvailableRoom(checkIn, checkOut, guests, type || null);
      if (!roomId) { toast.error("Aucune chambre disponible pour ces critères"); return; }
      const { data: room } = await supabase.from("rooms").select("*").eq("id", roomId).maybeSingle();
      setMatch(room);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirm() {
    if (!user) { toast.error("Veuillez vous connecter"); return; }
    if (!match) return;
    setSubmitting(true);
    const total = nights * Number(match.price_per_night);
    const { error } = await supabase.from("reservations").insert({
      room_id: match.id,
      profile_id: user.id,
      check_in: checkIn,
      check_out: checkOut,
      nights,
      guests_count: guests,
      total_price: total,
      status: "pending",
      special_requests: requests || null,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Réservation enregistrée !");
    navigate({ to: "/mes-reservations" });
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Réservation intelligente</span>
        <h1 className="mt-2 font-display text-4xl">Trouvez votre chambre idéale</h1>
        <p className="mt-2 text-muted-foreground">
          Indiquez vos dates et critères : nous attribuons automatiquement la meilleure chambre disponible.
        </p>

        <form onSubmit={handleSearch} className="mt-10 rounded-xl border border-border bg-card p-6 shadow-elegant">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Arrivée
              <input type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </label>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Départ
              <input type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </label>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Personnes
              <input type="number" min={1} max={10} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </label>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Type de chambre
              <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
          </div>
          <label className="mt-4 block text-xs uppercase tracking-wider text-muted-foreground">
            Demandes particulières (optionnel)
            <textarea value={requests} onChange={(e) => setRequests(e.target.value)} rows={2} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <Button type="submit" variant="hero" size="lg" className="mt-6 w-full" disabled={submitting}>
            {submitting ? "Recherche…" : "Trouver une chambre disponible"}
          </Button>
        </form>

        {match && (
          <div className="mt-8 rounded-xl border-2 border-gold-deep/40 bg-card p-6 shadow-elegant">
            <div className="flex items-center gap-2 text-gold-deep">
              <Sparkles className="size-5" />
              <span className="text-xs uppercase tracking-[0.3em]">Chambre proposée</span>
            </div>
            <h3 className="mt-2 font-display text-2xl">{match.name}</h3>
            <p className="text-sm text-muted-foreground">
              {ROOM_TYPE_LABEL[match.type as Room["type"]]} · n° {match.number} · jusqu'à {match.capacity} pers.
            </p>
            <div className="mt-4 flex items-end justify-between border-t border-border/60 pt-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{nights} nuit(s)</p>
                <p className="font-display text-3xl text-gold-deep">{formatXOF(nights * Number(match.price_per_night))}</p>
              </div>
              {user ? (
                <Button variant="hero" size="lg" onClick={handleConfirm} disabled={submitting}>
                  {submitting ? "…" : "Confirmer la réservation"}
                </Button>
              ) : (
                <Button variant="hero" size="lg" asChild>
                  <Link to="/auth">Se connecter pour réserver</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </section>
    </SiteShell>
  );
}