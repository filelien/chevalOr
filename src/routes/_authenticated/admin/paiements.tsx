import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminModuleLayout } from "@/components/admin/AdminModuleLayout";
import { useAdminI18n } from "@/hooks/use-admin-i18n";
import { formatXOF } from "@/lib/rooms";
import { markPaid } from "@/lib/reservations";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/paiements")({
  component: PaiementsPage,
});

function PaiementsPage() {
  const { ta } = useAdminI18n();
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

  const pending = data.filter((r: any) => r.payment_status !== "paid").length;

  async function encaisser(id: string, amount: number) {
    try {
      await markPaid(id, "cash", amount);
      toast.success(ta.common.saved);
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <AdminModuleLayout
      label={ta.payments.label}
      title={ta.payments.title}
      subtitle={ta.payments.subtitle}
      stats={[
        { label: ta.common.total, value: data.length, Icon: CreditCard },
        { label: ta.payments.pending, value: pending, Icon: CreditCard, accent: pending > 0 },
      ]}
    >
      {isLoading ? (
        <p className="text-muted-foreground">{ta.common.loading}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="audit-table w-full text-sm">
            <thead className="bg-[#f8f6f1] text-left text-[11px] font-bold uppercase tracking-widest text-foreground/70">
              <tr>
                <th className="p-3">{ta.payments.ref}</th>
                <th className="p-3">{ta.payments.client}</th>
                <th className="p-3">{ta.payments.arrival}</th>
                <th className="p-3">{ta.finance.amount}</th>
                <th className="p-3">{ta.common.status}</th>
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
                    <span className={`audit-badge ${r.payment_status === "paid" ? "audit-badge--success" : "audit-badge--warning"}`}>
                      {r.payment_status === "paid" ? ta.payments.paid : ta.payments.pending}
                    </span>
                  </td>
                  <td className="p-3">
                    {r.payment_status !== "paid" && (
                      <Button size="sm" variant="outline" onClick={() => encaisser(r.id, Number(r.total_price))}>{ta.payments.collect}</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminModuleLayout>
  );
}
