import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/layout/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { formatXOF } from "@/lib/rooms";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/mes-reservations")({
  component: MyReservations,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  checked_in: "Arrivée effectuée",
  checked_out: "Séjour terminé",
  cancelled: "Annulée",
};

function MyReservations() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*, rooms(name, number)")
        .order("check_in", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="font-display text-4xl">Mes réservations</h1>
        <p className="mt-2 text-muted-foreground">Historique et statut de vos séjours.</p>

        <div className="mt-10 space-y-4">
          {isLoading ? (
            <p className="text-muted-foreground">Chargement…</p>
          ) : (data?.length ?? 0) === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">Aucune réservation pour le moment.</p>
              <Button variant="hero" className="mt-4" asChild><Link to="/chambres">Réserver une chambre</Link></Button>
            </div>
          ) : data!.map((r: any) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Réf. {r.reference}</p>
                <p className="mt-1 font-display text-xl">{r.rooms?.name ?? "Chambre"}</p>
                <p className="text-sm text-muted-foreground">Du {r.check_in} au {r.check_out} · {r.nights} nuit(s) · {r.guests_count} pers.</p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs">{STATUS_LABEL[r.status] ?? r.status}</span>
                <p className="mt-2 font-display text-lg text-gold-deep">{formatXOF(Number(r.total_price))}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}