import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatXOF } from "@/lib/rooms";
import { markPaid } from "@/lib/reservations";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/admin/paiements")({
  component: PaiementsPage,
});

function PaiementsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("id, reference, total_price, payment_status, payment_method, paid_at, check_in, profiles(full_name, email)")
        .neq("status", "cancelled")
        .order("created_at", { ascending: false })
        .limit(80);
      if (error) throw error;
      return data ?? [];
    },
  });

  async function encaisser(id: string, amount: number) {
    try {
      await markPaid(id, "cash", amount);
      toast.success("Paiement enregistré");
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Finances"
        title="Centre des paiements"
        subtitle="Suivi des encaissements chambres — CinetPay, espèces, Mobile Money."
      />
      {isLoading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-secondary/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Réf.</th>
                <th className="p-3">Client</th>
                <th className="p-3">Arrivée</th>
                <th className="p-3">Montant</th>
                <th className="p-3">Statut</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {data.map((r: any) => (
                <tr key={r.id} className="border-b border-border/50">
                  <td className="p-3 font-mono text-xs">{r.reference}</td>
                  <td className="p-3">{r.profiles?.full_name ?? r.profiles?.email ?? "—"}</td>
                  <td className="p-3">{r.check_in}</td>
                  <td className="p-3 font-medium">{formatXOF(Number(r.total_price))}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${r.payment_status === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {r.payment_status ?? "unpaid"}
                    </span>
                  </td>
                  <td className="p-3">
                    {r.payment_status !== "paid" && (
                      <Button size="sm" variant="outline" onClick={() => encaisser(r.id, Number(r.total_price))}>Encaisser</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
