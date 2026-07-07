import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { findAvailableRoom, isRoomAvailable } from "@/lib/reservations";
import { validatePromoCode, applyDiscount } from "@/lib/promo";
import { formatXOF, ROOM_TYPE_LABEL, type Room } from "@/lib/rooms";
import { completeReservationFlow } from "@/lib/reservation-flow";
import { createGuestReservation } from "@/lib/guest-reservations";
import { toast } from "sonner";
import { Sparkles, Tag, User, Mail, Phone, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/reserver")({
  head: () => ({
    meta: [
      { title: "Réserver — Hôtel Le Cheval d'Or" },
      { name: "description", content: "Réservez votre chambre sans compte obligatoire. Formulaire simple et confirmation immédiate." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    in: (s.in as string) ?? "",
    out: (s.out as string) ?? "",
    guests: (s.guests as string) ?? "2",
    promo: (s.promo as string) ?? "",
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
  const search = Route.useSearch();
  const [checkIn, setCheckIn] = useState(search.in);
  const [checkOut, setCheckOut] = useState(search.out);
  const [guests, setGuests] = useState(Number(search.guests) || 2);
  const [type, setType] = useState<string>("");
  const [requests, setRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [match, setMatch] = useState<Room | null>(null);
  const [promoInput, setPromoInput] = useState(search.promo);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [confirmed, setConfirmed] = useState<{ reference: string; entity_code?: string } | null>(null);

  const [guestForm, setGuestForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    agreed_terms: false,
  });

  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;

  const subtotal = match ? nights * Number(match.price_per_night) : 0;
  const total = appliedPromo ? applyDiscount(subtotal, appliedPromo.percent).total : subtotal;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setMatch(null);
    setConfirmed(null);
    if (nights <= 0) { toast.error("Sélectionnez des dates valides"); return; }
    setSubmitting(true);
    try {
      const roomId = await findAvailableRoom(checkIn, checkOut, guests, type || null);
      if (!roomId) { toast.error("Aucune chambre disponible pour ces critères"); return; }
      const { data: room } = await supabase.from("rooms").select("*").eq("id", roomId).maybeSingle();
      setMatch(room as Room | null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  async function applyPromo() {
    try {
      const promo = await validatePromoCode(promoInput);
      if (!promo) { toast.error("Code invalide"); setAppliedPromo(null); return; }
      setAppliedPromo({ code: promo.code, percent: promo.discount_percent });
      toast.success(`-${promo.discount_percent}% appliqué`);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  }

  async function handleConfirmGuest() {
    if (!match) return;
    if (!guestForm.full_name.trim()) { toast.error("Nom complet requis"); return; }
    if (!guestForm.email.includes("@")) { toast.error("Email invalide"); return; }
    if (!guestForm.phone.trim()) { toast.error("Numéro de téléphone requis"); return; }
    if (!guestForm.agreed_terms) { toast.error("Acceptez les conditions"); return; }

    setSubmitting(true);
    const ok = await isRoomAvailable(match.id, checkIn, checkOut);
    if (!ok) { toast.error("Chambre plus disponible"); setSubmitting(false); return; }

    const result = await createGuestReservation({
      full_name: guestForm.full_name,
      email: guestForm.email,
      phone: guestForm.phone,
      check_in: checkIn,
      check_out: checkOut,
      room_id: match.id,
      guests_count: guests,
      special_requests: requests || undefined,
      agreed_terms: guestForm.agreed_terms,
    });
    setSubmitting(false);

    if (!result.success) { toast.error(result.error ?? "Erreur"); return; }
    setConfirmed({ reference: result.booking_reference!, entity_code: result.entity_code });
    toast.success("Réservation enregistrée !");
  }

  async function handleConfirmAuth() {
    if (!user || !match) return;
    setSubmitting(true);
    const discountPercent = appliedPromo?.percent ?? null;
    const ok = await isRoomAvailable(match.id, checkIn, checkOut);
    if (!ok) { toast.error("Chambre plus disponible"); setSubmitting(false); return; }
    const { data: created, error } = await supabase.from("reservations").insert({
      room_id: match.id,
      profile_id: user.id,
      check_in: checkIn,
      check_out: checkOut,
      nights,
      guests_count: guests,
      total_price: total,
      status: "pending",
      special_requests: requests || null,
      promo_code: appliedPromo?.code ?? null,
      discount_percent: discountPercent,
      payment_status: "unpaid",
      source: "website",
      guest_name: user.user_metadata?.full_name ?? null,
      guest_email: user.email ?? null,
    }).select("id, reference, entity_code").single();
    setSubmitting(false);
    if (error || !created) { toast.error(error?.message ?? "Erreur"); return; }

    const flowResult = await completeReservationFlow({
      reservationId: created.id,
      reference: created.reference ?? created.id,
      email: user.email ?? "",
      customerName: user.user_metadata?.full_name ?? user.email ?? "Client",
      profileId: user.id,
      roomId: match.id,
      checkIn,
      checkOut,
      total,
      roomName: match.name,
    });

    if (flowResult.kind === "redirect") {
      toast.success("Redirection vers le paiement sécurisé…");
      window.location.href = flowResult.paymentUrl;
      return;
    }
    toast.success(flowResult.message);
    navigate({ to: "/mes-reservations" });
  }

  if (confirmed) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-lg px-6 py-20 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="size-10 text-emerald-600" />
          </div>
          <h1 className="mt-6 font-display text-3xl">Réservation confirmée</h1>
          <p className="mt-2 text-muted-foreground">Un email de confirmation a été envoyé à {guestForm.email}</p>
          <div className="mt-8 rounded-xl border border-gold/30 bg-gold-soft/20 p-6">
            <p className="text-xs uppercase tracking-widest text-gold-deep">Référence</p>
            <p className="mt-1 font-mono text-2xl font-semibold">{confirmed.reference}</p>
            {confirmed.entity_code && (
              <>
                <p className="mt-4 text-xs uppercase tracking-widest text-gold-deep">Code suivi</p>
                <p className="mt-1 font-mono text-lg">{confirmed.entity_code}</p>
              </>
            )}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Conservez cette référence pour suivre votre réservation.</p>
          <Button variant="hero" className="mt-8" asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Réservation intelligente</span>
        <h1 className="mt-2 font-display text-4xl">Trouvez votre chambre idéale</h1>
        <p className="mt-2 text-muted-foreground">
          Réservez sans compte — renseignez simplement vos coordonnées pour finaliser.
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
          <div className="mt-4 flex gap-2">
            <input value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} placeholder="Code promo (CHEVAL20…)"
              className="flex-1 rounded-md border border-input px-3 py-2 text-sm uppercase" />
            <Button type="button" variant="outline" onClick={applyPromo}><Tag className="size-4" /></Button>
          </div>
        </form>

        {match && (
          <div className="mt-8 space-y-6">
            <div className="rounded-xl border-2 border-gold-deep/40 bg-card p-6 shadow-elegant">
              <div className="flex items-center gap-2 text-gold-deep">
                <Sparkles className="size-5" />
                <span className="text-xs uppercase tracking-[0.3em]">Chambre proposée</span>
              </div>
              <h3 className="mt-2 font-display text-2xl">{match.name}</h3>
              <p className="text-sm text-muted-foreground">
                {ROOM_TYPE_LABEL[match.type]} · n° {match.number} · jusqu'à {match.capacity} pers.
              </p>
              <div className="mt-4 border-t border-border/60 pt-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{nights} nuit(s)</p>
                <p className="font-display text-3xl text-gold-deep">{formatXOF(total)}</p>
                {appliedPromo && <p className="text-xs text-emerald-600">Code {appliedPromo.code} (-{appliedPromo.percent}%)</p>}
              </div>
            </div>

            {user ? (
              <div className="flex justify-end">
                <Button variant="hero" size="lg" onClick={handleConfirmAuth} disabled={submitting}>
                  {submitting ? "Enregistrement…" : "Confirmer la réservation"}
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 shadow-elegant">
                <h3 className="font-display text-xl">Vos coordonnées</h3>
                <p className="mt-1 text-sm text-muted-foreground">Aucun compte requis — vos informations sont enregistrées directement.</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm sm:col-span-2">
                    <span className="flex items-center gap-1 text-muted-foreground"><User className="size-3.5" /> Nom complet *</span>
                    <input required value={guestForm.full_name} onChange={(e) => setGuestForm((f) => ({ ...f, full_name: e.target.value }))}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm" placeholder="Jean Dupont" />
                  </label>
                  <label className="text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground"><Mail className="size-3.5" /> Email *</span>
                    <input required type="email" value={guestForm.email} onChange={(e) => setGuestForm((f) => ({ ...f, email: e.target.value }))}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm" placeholder="vous@email.com" />
                  </label>
                  <label className="text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground"><Phone className="size-3.5" /> Téléphone *</span>
                    <input required type="tel" value={guestForm.phone} onChange={(e) => setGuestForm((f) => ({ ...f, phone: e.target.value }))}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm" placeholder="+228 90 00 00 00" />
                  </label>
                </div>
                <label className="mt-4 flex items-start gap-2 text-sm">
                  <input type="checkbox" checked={guestForm.agreed_terms} onChange={(e) => setGuestForm((f) => ({ ...f, agreed_terms: e.target.checked }))} className="mt-1" />
                  <span>J'accepte les conditions générales et la politique de confidentialité de l'hôtel.</span>
                </label>
                <Button variant="hero" size="lg" className="mt-6 w-full" onClick={handleConfirmGuest} disabled={submitting}>
                  {submitting ? "Enregistrement…" : "Confirmer ma réservation"}
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Déjà client ? <Link to="/auth" className="text-gold-deep underline">Connectez-vous</Link> pour accéder à votre espace.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
