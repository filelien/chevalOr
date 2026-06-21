import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteShell } from "@/components/layout/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { formatXOF } from "@/lib/rooms";
import { Button } from "@/components/ui/button";
import { cancelReservation, STATUS_BADGE, STATUS_LABEL, type ReservationStatus } from "@/lib/reservations";
import { generateInvoicePDF } from "@/lib/invoice";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Download, Receipt, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/mes-reservations")({
  component: MyReservations,
});

function MyReservations() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["my-reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*, rooms(name, number, price_per_night)")
        .order("check_in", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  async function handleCancel(id: string, ref: string) {
    if (!confirm(`Annuler la réservation ${ref} ?`)) return;
    try {
      await cancelReservation(id, "Annulée par le client");
      toast.success("Réservation annulée");
      qc.invalidateQueries({ queryKey: ["my-reservations"] });
    } catch (e: any) { toast.error(e.message); }
  }

  function downloadPDF(r: any, type: "invoice" | "receipt") {
    generateInvoicePDF({
      reference: r.reference,
      type,
      client: {
        name: profile?.full_name || user?.email || "Client",
        email: profile?.email || user?.email,
        phone: profile?.phone,
        address: profile?.address,
      },
      room: { name: r.rooms?.name ?? "Chambre", number: r.rooms?.number ?? "" },
      check_in: r.check_in,
      check_out: r.check_out,
      nights: r.nights,
      guests_count: r.guests_count,
      price_per_night: Number(r.rooms?.price_per_night ?? r.total_price / Math.max(1, r.nights)),
      total: Number(r.total_price),
      payment_method: r.payment_method,
      paid_at: r.paid_at,
    });
  }

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
          ) : data!.map((r: any) => {
            const status = r.status as ReservationStatus;
            const canCancel = status === "pending" || status === "confirmed";
            return (
              <div key={r.id} className="rounded-xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Réf. {r.reference}</p>
                    <p className="mt-1 font-display text-xl">{r.rooms?.name ?? "Chambre"}</p>
                    <p className="text-sm text-muted-foreground">
                      Du {r.check_in} au {r.check_out} · {r.nights} nuit(s) · {r.guests_count} pers.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-3 py-1 text-xs ${STATUS_BADGE[status] ?? "bg-secondary"}`}>
                      {STATUS_LABEL[status] ?? status}
                    </span>
                    <p className="mt-2 font-display text-lg text-gold-deep">{formatXOF(Number(r.total_price))}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
                  <Button size="sm" variant="outline" onClick={() => downloadPDF(r, "invoice")}>
                    <Download className="mr-1 size-4" /> Facture PDF
                  </Button>
                  {r.paid_at && (
                    <Button size="sm" variant="outline" onClick={() => downloadPDF(r, "receipt")}>
                      <Receipt className="mr-1 size-4" /> Reçu PDF
                    </Button>
                  )}
                  {canCancel && (
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleCancel(r.id, r.reference)}>
                      <XCircle className="mr-1 size-4" /> Annuler
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}