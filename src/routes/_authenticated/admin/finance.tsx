import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatXOF } from "@/lib/rooms";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/finance")({
  component: AdminFinance,
});

function AdminFinance() {
  const qc = useQueryClient();
  const [editor, setEditor] = useState<any | null>(null);

  const { data: records } = useQuery({
    queryKey: ["finance"],
    queryFn: async () => {
      const { data, error } = await supabase.from("financial_records").select("*").order("record_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: reservations } = useQuery({
    queryKey: ["finance-res"],
    queryFn: async () => {
      const { data } = await supabase.from("reservations").select("total_price, paid_at, payment_amount").not("paid_at", "is", null);
      return data ?? [];
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["finance-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("restaurant_orders").select("total").eq("status", "paid");
      return data ?? [];
    },
  });

  const stats = useMemo(() => {
    const hotelRev = (reservations ?? []).reduce((s, r) => s + Number(r.payment_amount ?? r.total_price ?? 0), 0);
    const restRev = (orders ?? []).reduce((s, o) => s + Number(o.total ?? 0), 0);
    const income = (records ?? []).filter((r: any) => r.type === "income").reduce((s, r: any) => s + Number(r.amount), 0);
    const expense = (records ?? []).filter((r: any) => r.type === "expense").reduce((s, r: any) => s + Number(r.amount), 0);
    const totalIncome = hotelRev + restRev + income;
    return { hotelRev, restRev, income, expense, profit: totalIncome - expense };
  }, [records, reservations, orders]);

  async function save() {
    if (!editor) return;
    try {
      const row = { type: editor.type, category: editor.category, amount: editor.amount, description: editor.description, record_date: editor.record_date };
      if (editor.id) await supabase.from("financial_records").update(row).eq("id", editor.id);
      else await supabase.from("financial_records").insert(row);
      toast.success("Enregistré");
      setEditor(null);
      qc.invalidateQueries({ queryKey: ["finance"] });
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="p-6 lg:p-10">
      <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Finance</span>
      <h1 className="mt-2 font-display text-4xl">Comptabilité</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Revenus hôtel", val: stats.hotelRev },
          { label: "Revenus restaurant", val: stats.restRev },
          { label: "Dépenses", val: stats.expense },
          { label: "Bénéfice estimé", val: stats.profit },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs uppercase text-muted-foreground">{k.label}</p>
            <p className="mt-2 font-display text-2xl text-gold-deep">{formatXOF(k.val)}</p>
          </div>
        ))}
      </div>
      <Button className="mt-6" variant="hero" size="sm" onClick={() => setEditor({ type: "expense", category: "", amount: 0, description: "", record_date: new Date().toISOString().slice(0, 10) })}>
        <Plus className="mr-1 size-4" />Nouvelle écriture
      </Button>
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-left">Catégorie</th><th className="px-4 py-3 text-left">Montant</th></tr>
          </thead>
          <tbody>
            {(records ?? []).map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">{r.record_date}</td>
                <td className="px-4 py-3">{r.type === "income" ? "Revenu" : "Dépense"}</td>
                <td className="px-4 py-3">{r.category}</td>
                <td className="px-4 py-3 font-medium">{formatXOF(Number(r.amount))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 space-y-3">
            <select value={editor.type} onChange={(e) => setEditor({ ...editor, type: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="income">Revenu</option><option value="expense">Dépense</option>
            </select>
            <input placeholder="Catégorie" value={editor.category} onChange={(e) => setEditor({ ...editor, category: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" />
            <input type="number" placeholder="Montant" value={editor.amount} onChange={(e) => setEditor({ ...editor, amount: Number(e.target.value) })} className="w-full rounded-md border px-3 py-2 text-sm" />
            <input type="date" value={editor.record_date} onChange={(e) => setEditor({ ...editor, record_date: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" />
            <textarea placeholder="Description" value={editor.description} onChange={(e) => setEditor({ ...editor, description: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm" />
            <div className="flex gap-2"><Button variant="ghost" onClick={() => setEditor(null)}>Annuler</Button><Button variant="hero" onClick={save}>Enregistrer</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}
