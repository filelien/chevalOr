import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatXOF } from "@/lib/rooms";
import { downloadCsv } from "@/lib/export-csv";
import { useAuth } from "@/lib/auth";
import { useAdminI18n } from "@/hooks/use-admin-i18n";
import { AdminModuleLayout, AdminChartCard, AdminDataTable } from "@/components/admin/AdminModuleLayout";
import { toast } from "sonner";
import { Plus, Download, Pencil, Trash2, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export const Route = createFileRoute("/_authenticated/admin/finance")({
  component: AdminFinance,
});

function AdminFinance() {
  const { ta } = useAdminI18n();
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
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

  const chartData = useMemo(() => [
    { name: ta.finance.hotelRevenue, value: stats.hotelRev, fill: "#C9A227" },
    { name: ta.finance.restRevenue, value: stats.restRev, fill: "#1a1d24" },
    { name: ta.finance.expenses, value: stats.expense, fill: "#dc2626" },
  ], [stats, ta.finance]);

  async function save() {
    if (!editor) return;
    try {
      const row = { type: editor.type, category: editor.category, amount: editor.amount, description: editor.description, record_date: editor.record_date };
      if (editor.id) await supabase.from("financial_records").update(row).eq("id", editor.id);
      else await supabase.from("financial_records").insert(row);
      toast.success(ta.common.saved);
      setEditor(null);
      qc.invalidateQueries({ queryKey: ["finance"] });
    } catch (e: any) { toast.error(e.message); }
  }

  async function remove(id: string) {
    if (!confirm(ta.common.confirmDelete)) return;
    try {
      const { error } = await supabase.from("financial_records").delete().eq("id", id);
      if (error) throw error;
      toast.success(ta.common.saved);
      qc.invalidateQueries({ queryKey: ["finance"] });
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <AdminModuleLayout
      label={ta.finance.label}
      title={ta.finance.title}
      subtitle={ta.finance.subtitle}
      stats={[
        { label: ta.finance.hotelRevenue, value: formatXOF(stats.hotelRev), Icon: Wallet, accent: true },
        { label: ta.finance.restRevenue, value: formatXOF(stats.restRev), Icon: TrendingUp },
        { label: ta.finance.expenses, value: formatXOF(stats.expense), Icon: TrendingDown },
        { label: ta.finance.profit, value: formatXOF(stats.profit), Icon: Wallet },
      ]}
      actions={
        <>
          {hasPermission("finance.export") && (
            <Button variant="outline" size="sm" onClick={() => downloadCsv(
              `finance-${new Date().toISOString().slice(0, 10)}.csv`,
              [ta.finance.date, ta.common.status, ta.finance.category, ta.finance.amount, ta.finance.description],
              (records ?? []).map((r: any) => [r.record_date, r.type, r.category, r.amount, r.description ?? ""]),
            )}><Download className="mr-1 size-4" />{ta.common.export}</Button>
          )}
          {hasPermission("finance.create") && (
            <Button variant="hero" size="sm" onClick={() => setEditor({ type: "expense", category: "", amount: 0, description: "", record_date: new Date().toISOString().slice(0, 10) })}>
              <Plus className="mr-1 size-4" />{ta.finance.newEntry}
            </Button>
          )}
        </>
      }
    >
      <AdminChartCard title={ta.finance.chartTitle}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v: number) => formatXOF(v)} />
              <Legend />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AdminChartCard>

      <AdminDataTable>
        <table className="audit-table w-full text-sm">
          <thead className="bg-[#f8f6f1] text-left text-[11px] font-bold uppercase tracking-widest text-foreground/70">
            <tr>
              <th className="p-3">{ta.finance.date}</th>
              <th className="p-3">{ta.common.status}</th>
              <th className="p-3">{ta.finance.category}</th>
              <th className="p-3">{ta.finance.amount}</th>
              <th className="p-3 text-right">{ta.common.actions}</th>
            </tr>
          </thead>
          <tbody>
            {(records ?? []).map((r: any) => (
              <tr key={r.id} className="border-t border-border/50 hover:bg-secondary/20">
                <td className="p-3">{r.record_date}</td>
                <td className="p-3">
                  <span className={`audit-badge ${r.type === "income" ? "audit-badge--success" : "audit-badge--warning"}`}>
                    {r.type === "income" ? ta.finance.income.toUpperCase() : ta.finance.expense.toUpperCase()}
                  </span>
                </td>
                <td className="p-3">{r.category}</td>
                <td className="p-3 font-medium text-gold-deep">{formatXOF(Number(r.amount))}</td>
                <td className="p-3 text-right">
                  {hasPermission("finance.edit") && <Button size="sm" variant="ghost" onClick={() => setEditor(r)}><Pencil className="size-4" /></Button>}
                  {hasPermission("finance.delete") && <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="size-4 text-destructive" /></Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminDataTable>

      {editor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-2xl space-y-3">
            <h3 className="font-display text-xl">{editor.id ? ta.common.edit : ta.finance.newEntry}</h3>
            <select value={editor.type} onChange={(e) => setEditor({ ...editor, type: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm">
              <option value="income">{ta.finance.income}</option>
              <option value="expense">{ta.finance.expense}</option>
            </select>
            <input placeholder={ta.finance.category} value={editor.category} onChange={(e) => setEditor({ ...editor, category: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
            <input type="number" placeholder={ta.finance.amount} value={editor.amount} onChange={(e) => setEditor({ ...editor, amount: Number(e.target.value) })} className="w-full rounded-lg border px-3 py-2 text-sm" />
            <input type="date" value={editor.record_date} onChange={(e) => setEditor({ ...editor, record_date: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
            <textarea placeholder={ta.finance.description} value={editor.description ?? ""} onChange={(e) => setEditor({ ...editor, description: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" rows={3} />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setEditor(null)}>{ta.common.cancel}</Button>
              <Button variant="hero" onClick={save}>{ta.common.save}</Button>
            </div>
          </div>
        </div>
      )}
    </AdminModuleLayout>
  );
}
