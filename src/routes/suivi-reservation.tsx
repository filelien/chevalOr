import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Button } from "@/components/ui/button";
import { getGuestReservationStatus } from "@/lib/guest-reservations";
import { formatXOF } from "@/lib/rooms";
import { STATUS_BADGE, STATUS_LABEL, type ReservationStatus } from "@/lib/reservations";
import { Search, BedDouble, Calendar, Hash } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const Route = createFileRoute("/suivi-reservation")({
  component: SuiviReservationPage,
  head: () => ({
    meta: [{ title: "Suivi réservation — Hôtel Le Cheval d'Or" }],
  }),
});

function SuiviReservationPage() {
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof getGuestReservationStatus>>>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!ref.trim()) return;
    setLoading(true);
    setResult(null);
    const data = await getGuestReservationStatus(ref.trim().toUpperCase());
    setResult(data);
    setLoading(false);
  }

  const status = result?.status as ReservationStatus | undefined;

  return (
    <SiteShell>
      <section className="mx-auto max-w-xl px-6 py-16">
        <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Sans compte</span>
        <h1 className="mt-2 font-display text-3xl">Suivre ma réservation</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Entrez votre référence ou code de suivi reçu par email.
        </p>

        <form onSubmit={handleSearch} className="mt-8 flex gap-2">
          <div className="relative flex-1">
            <Hash className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="RES-20260707-1234 ou BOOK-000001"
              className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm uppercase"
            />
          </div>
          <Button type="submit" variant="hero" disabled={loading}>
            <Search className="mr-1 size-4" />{loading ? "…" : "Rechercher"}
          </Button>
        </form>

        {result === null && !loading && ref && (
          <p className="mt-6 text-center text-sm text-muted-foreground">Aucune réservation trouvée pour cette référence.</p>
        )}

        {result && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
            <div className="bg-gradient-to-r from-gold-soft/40 to-transparent px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold-deep">Réf. {result.booking_reference}</p>
              {result.entity_code && (
                <p className="mt-1 font-mono text-sm text-muted-foreground">Code {result.entity_code}</p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <h2 className="font-display text-xl">{result.room_name}</h2>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[status!] ?? ""}`}>
                  {STATUS_LABEL[status!] ?? status}
                </span>
              </div>
            </div>
            <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 size-4 text-gold-deep" />
                <div>
                  <p className="text-xs text-muted-foreground">Arrivée</p>
                  <p className="text-sm font-medium">{format(new Date(result.check_in), "d MMMM yyyy", { locale: fr })}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 size-4 text-gold-deep" />
                <div>
                  <p className="text-xs text-muted-foreground">Départ</p>
                  <p className="text-sm font-medium">{format(new Date(result.check_out), "d MMMM yyyy", { locale: fr })}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <BedDouble className="mt-0.5 size-4 text-gold-deep" />
                <div>
                  <p className="text-xs text-muted-foreground">Montant</p>
                  <p className="font-display text-lg text-gold-deep">{formatXOF(result.total_price)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
