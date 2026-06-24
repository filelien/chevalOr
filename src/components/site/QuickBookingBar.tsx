import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { reserverSearch } from "@/lib/reserver-search";
import { Calendar, Users } from "lucide-react";

export function QuickBookingBar() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  return (
    <div className="mx-auto -mt-16 relative z-20 max-w-4xl rounded-xl border border-border/60 bg-card p-4 shadow-elegant md:p-6">
      <div className="grid gap-4 md:grid-cols-4 md:items-end">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">
          <Calendar className="mb-1 inline size-4" /> Arrivée
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </label>
        <label className="text-xs uppercase tracking-wider text-muted-foreground">
          Départ
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </label>
        <label className="text-xs uppercase tracking-wider text-muted-foreground">
          <Users className="mb-1 inline size-4" /> Personnes
          <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <Button variant="hero" size="lg" className="w-full" asChild>
          <Link to="/reserver" search={reserverSearch({ in: checkIn, out: checkOut, guests: String(guests) })}>Vérifier disponibilité</Link>
        </Button>
      </div>
    </div>
  );
}
