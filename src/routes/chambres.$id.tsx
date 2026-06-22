<<<<<<< HEAD
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Button } from "@/components/ui/button";
import { fetchRoom, formatXOF, ROOM_TYPE_LABEL } from "@/lib/rooms";
import { isRoomAvailable } from "@/lib/reservations";
import { validatePromoCode, applyDiscount } from "@/lib/promo";
import { Users, Maximize2, Check, Tag } from "lucide-react";
=======
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Button } from "@/components/ui/button";
import { fetchRoom, formatXOF, ROOM_TYPE_LABEL } from "@/lib/rooms";
import { Users, Maximize2, Check } from "lucide-react";
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
import roomImg from "@/assets/room-deluxe.jpg";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
<<<<<<< HEAD
import { hotelJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/chambres/$id")({
  head: () => ({
    meta: [{ title: "Chambre — Hôtel Le Cheval d'Or" }],
  }),
=======

export const Route = createFileRoute("/chambres/$id")({
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
  errorComponent: ({ error }) => <SiteShell><div className="p-12 text-center text-destructive">{error.message}</div></SiteShell>,
  notFoundComponent: () => <SiteShell><div className="p-12 text-center">Chambre introuvable</div></SiteShell>,
  component: RoomDetail,
});

function RoomDetail() {
  const { id } = Route.useParams();
<<<<<<< HEAD
  const navigate = useNavigate();
=======
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
  const { data: room, isLoading } = useQuery({ queryKey: ["room", id], queryFn: () => fetchRoom(id) });
  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestsCount, setGuestsCount] = useState(2);
<<<<<<< HEAD
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const nights = checkIn && checkOut ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : 0;
  const subtotal = nights * Number(room?.price_per_night ?? 0);
  const pricing = useMemo(() => {
    if (!appliedPromo) return { total: subtotal, discount: 0 };
    return applyDiscount(subtotal, appliedPromo.percent);
  }, [subtotal, appliedPromo]);
=======
  const [submitting, setSubmitting] = useState(false);
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014

  if (isLoading) return <SiteShell><div className="p-24 text-center text-muted-foreground">Chargement…</div></SiteShell>;
  if (!room) return <SiteShell><div className="p-24 text-center">Chambre introuvable</div></SiteShell>;

<<<<<<< HEAD
  const cover = room.photos.find((p) => p.is_cover) ?? room.photos[0];

  async function checkAvailability() {
    if (nights <= 0) { setAvailable(null); return; }
    setCheckingAvail(true);
    try {
      const ok = await isRoomAvailable(room!.id, checkIn, checkOut);
      setAvailable(ok);
      if (!ok) toast.error("Chambre indisponible sur ces dates");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur de vérification");
    } finally {
      setCheckingAvail(false);
    }
  }

  async function applyPromo() {
    try {
      const promo = await validatePromoCode(promoInput);
      if (!promo) { toast.error("Code promo invalide ou expiré"); setAppliedPromo(null); return; }
      setAppliedPromo({ code: promo.code, percent: promo.discount_percent });
      toast.success(`Code ${promo.code} appliqué (-${promo.discount_percent}%)`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur promo");
    }
  }

=======
  const nights = checkIn && checkOut ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : 0;
  const total = nights * Number(room.price_per_night);
  const cover = room.photos.find((p) => p.is_cover) ?? room.photos[0];

>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
  async function handleReserve(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { toast.error("Veuillez vous connecter pour réserver"); return; }
    if (nights <= 0) { toast.error("Sélectionnez des dates valides"); return; }
    if (guestsCount > room!.capacity) { toast.error(`Capacité max : ${room!.capacity} personnes`); return; }
    setSubmitting(true);
<<<<<<< HEAD
    const ok = await isRoomAvailable(room!.id, checkIn, checkOut);
    if (!ok) { toast.error("Cette chambre n'est plus disponible"); setSubmitting(false); setAvailable(false); return; }
=======
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
    const { error } = await supabase.from("reservations").insert({
      room_id: room!.id,
      profile_id: user.id,
      check_in: checkIn,
      check_out: checkOut,
      nights,
      guests_count: guestsCount,
<<<<<<< HEAD
      total_price: pricing.total,
      status: "pending",
      promo_code: appliedPromo?.code ?? null,
      discount_percent: appliedPromo?.percent ?? null,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Réservation enregistrée !");
    navigate({ to: "/mes-reservations" });
=======
      total_price: total,
      status: "pending",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Demande de réservation envoyée !");
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
  }

  return (
    <SiteShell>
<<<<<<< HEAD
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelJsonLd()) }} />
=======
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
      <div className="mx-auto max-w-7xl px-6 py-12">
        <Link to="/chambres" className="text-sm text-muted-foreground hover:text-gold-deep">← Toutes les chambres</Link>
        <div className="mt-8 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-xl bg-muted shadow-elegant">
              <img src={cover?.url ?? roomImg} alt={room.name} className="aspect-[4/3] size-full object-cover" />
            </div>
            {room.photos.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {room.photos.slice(0, 4).map((p) => (
                  <img key={p.id} src={p.url} alt="" className="aspect-square size-full rounded-md object-cover" loading="lazy" />
                ))}
              </div>
            )}
<<<<<<< HEAD
=======

>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
            <span className="mt-8 inline-block text-xs uppercase tracking-[0.3em] text-gold-deep">{ROOM_TYPE_LABEL[room.type]}</span>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">{room.name}</h1>
            <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Users className="size-4" /> Jusqu'à {room.capacity} personnes</span>
              {room.size_sqm && <span className="flex items-center gap-2"><Maximize2 className="size-4" /> {room.size_sqm} m²</span>}
              <span>Chambre n° {room.number}</span>
            </div>
            <p className="mt-6 leading-relaxed text-foreground/80">{room.description}</p>
<<<<<<< HEAD
=======

>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
            {room.amenities.length > 0 && (
              <div className="mt-8">
                <h3 className="font-display text-xl">Équipements</h3>
                <ul className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                  {room.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2"><Check className="size-4 text-gold-deep" /> {a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <form onSubmit={handleReserve} className="rounded-xl border border-border bg-card p-6 shadow-elegant">
              <div className="flex items-baseline justify-between border-b border-border/60 pb-4">
                <span className="font-display text-3xl text-gold-deep">{formatXOF(room.price_per_night)}</span>
                <span className="text-sm text-muted-foreground">/ nuit</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Arrivée
<<<<<<< HEAD
                  <input type="date" required value={checkIn} onChange={(e) => { setCheckIn(e.target.value); setAvailable(null); }}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </label>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Départ
                  <input type="date" required value={checkOut} onChange={(e) => { setCheckOut(e.target.value); setAvailable(null); }}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
=======
                  <input type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" />
                </label>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Départ
                  <input type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" />
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
                </label>
              </div>
              <label className="mt-3 block text-xs uppercase tracking-wider text-muted-foreground">
                Personnes
<<<<<<< HEAD
                <input type="number" min={1} max={room.capacity} value={guestsCount} onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </label>
              {nights > 0 && (
                <Button type="button" variant="outline" size="sm" className="mt-3 w-full" onClick={checkAvailability} disabled={checkingAvail}>
                  {checkingAvail ? "Vérification…" : "Vérifier disponibilité"}
                </Button>
              )}
              {available === true && <p className="mt-2 text-center text-xs text-emerald-600">✓ Disponible sur ces dates</p>}
              {available === false && <p className="mt-2 text-center text-xs text-destructive">Indisponible — choisissez d'autres dates</p>}
              <div className="mt-4 flex gap-2">
                <input value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} placeholder="Code promo"
                  className="flex-1 rounded-md border border-input px-3 py-2 text-sm uppercase" />
                <Button type="button" variant="outline" size="sm" onClick={applyPromo}><Tag className="size-4" /></Button>
              </div>
              {appliedPromo && <p className="mt-1 text-xs text-emerald-600">{appliedPromo.code} : -{appliedPromo.percent}%</p>}
              {nights > 0 && (
                <div className="mt-4 space-y-1 border-t border-border/60 pt-4 text-sm">
                  <div className="flex justify-between text-muted-foreground"><span>{nights} nuit(s)</span><span>{formatXOF(subtotal)}</span></div>
                  {pricing.discount > 0 && (
                    <div className="flex justify-between text-emerald-600"><span>Remise</span><span>-{formatXOF(pricing.discount)}</span></div>
                  )}
                  <div className="flex justify-between font-display text-lg"><span>Total</span><span className="text-gold-deep">{formatXOF(pricing.total)}</span></div>
                </div>
              )}
              {user ? (
                <Button type="submit" variant="hero" size="lg" className="mt-6 w-full" disabled={submitting || available === false}>
=======
                <input type="number" min={1} max={room.capacity} value={guestsCount} onChange={(e) => setGuestsCount(Number(e.target.value))} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" />
              </label>
              {nights > 0 && (
                <div className="mt-4 space-y-1 border-t border-border/60 pt-4 text-sm">
                  <div className="flex justify-between text-muted-foreground"><span>{nights} nuit(s)</span><span>{formatXOF(room.price_per_night)} × {nights}</span></div>
                  <div className="flex justify-between font-display text-lg"><span>Total</span><span className="text-gold-deep">{formatXOF(total)}</span></div>
                </div>
              )}
              {user ? (
                <Button type="submit" variant="hero" size="lg" className="mt-6 w-full" disabled={submitting}>
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
                  {submitting ? "Envoi…" : "Réserver"}
                </Button>
              ) : (
                <Button variant="hero" size="lg" className="mt-6 w-full" asChild>
                  <Link to="/auth">Se connecter pour réserver</Link>
                </Button>
              )}
<<<<<<< HEAD
              <p className="mt-3 text-center text-xs text-muted-foreground">Paiement à l'arrivée · Espèces, carte, Mobile Money</p>
=======
              <p className="mt-3 text-center text-xs text-muted-foreground">Confirmation par la réception sous 24h.</p>
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
            </form>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
