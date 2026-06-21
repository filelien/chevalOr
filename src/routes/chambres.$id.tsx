import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Button } from "@/components/ui/button";
import { fetchRoom, formatXOF, ROOM_TYPE_LABEL } from "@/lib/rooms";
import { Users, Maximize2, Check } from "lucide-react";
import roomImg from "@/assets/room-deluxe.jpg";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/chambres/$id")({
  errorComponent: ({ error }) => <SiteShell><div className="p-12 text-center text-destructive">{error.message}</div></SiteShell>,
  notFoundComponent: () => <SiteShell><div className="p-12 text-center">Chambre introuvable</div></SiteShell>,
  component: RoomDetail,
});

function RoomDetail() {
  const { id } = Route.useParams();
  const { data: room, isLoading } = useQuery({ queryKey: ["room", id], queryFn: () => fetchRoom(id) });
  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestsCount, setGuestsCount] = useState(2);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return <SiteShell><div className="p-24 text-center text-muted-foreground">Chargement…</div></SiteShell>;
  if (!room) return <SiteShell><div className="p-24 text-center">Chambre introuvable</div></SiteShell>;

  const nights = checkIn && checkOut ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : 0;
  const total = nights * Number(room.price_per_night);
  const cover = room.photos.find((p) => p.is_cover) ?? room.photos[0];

  async function handleReserve(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { toast.error("Veuillez vous connecter pour réserver"); return; }
    if (nights <= 0) { toast.error("Sélectionnez des dates valides"); return; }
    if (guestsCount > room!.capacity) { toast.error(`Capacité max : ${room!.capacity} personnes`); return; }
    setSubmitting(true);
    const { error } = await supabase.from("reservations").insert({
      room_id: room!.id,
      profile_id: user.id,
      check_in: checkIn,
      check_out: checkOut,
      nights,
      guests_count: guestsCount,
      total_price: total,
      status: "pending",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Demande de réservation envoyée !");
  }

  return (
    <SiteShell>
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

            <span className="mt-8 inline-block text-xs uppercase tracking-[0.3em] text-gold-deep">{ROOM_TYPE_LABEL[room.type]}</span>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">{room.name}</h1>
            <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Users className="size-4" /> Jusqu'à {room.capacity} personnes</span>
              {room.size_sqm && <span className="flex items-center gap-2"><Maximize2 className="size-4" /> {room.size_sqm} m²</span>}
              <span>Chambre n° {room.number}</span>
            </div>
            <p className="mt-6 leading-relaxed text-foreground/80">{room.description}</p>

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
                  <input type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" />
                </label>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Départ
                  <input type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" />
                </label>
              </div>
              <label className="mt-3 block text-xs uppercase tracking-wider text-muted-foreground">
                Personnes
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
                  {submitting ? "Envoi…" : "Réserver"}
                </Button>
              ) : (
                <Button variant="hero" size="lg" className="mt-6 w-full" asChild>
                  <Link to="/auth">Se connecter pour réserver</Link>
                </Button>
              )}
              <p className="mt-3 text-center text-xs text-muted-foreground">Confirmation par la réception sous 24h.</p>
            </form>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}