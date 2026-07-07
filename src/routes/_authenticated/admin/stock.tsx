import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAdminI18n } from "@/hooks/use-admin-i18n";
import { AdminModuleLayout, AdminDataTable } from "@/components/admin/AdminModuleLayout";
import { formatXOF } from "@/lib/rooms";
import { toast } from "sonner";
import { Plus, AlertTriangle, ScanLine, Boxes } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/stock")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: search.tab === "scan" ? "scan" as const : "inventory" as const,
  }),
  component: AdminStock,
});

function AdminStock() {
  const { ta } = useAdminI18n();
  const { tab } = Route.useSearch();
  const qc = useQueryClient();
  const [editor, setEditor] = useState<any | null>(null);
  const [scanCode, setScanCode] = useState("");
  const [scanQty, setScanQty] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory_items").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const lowStock = useMemo(
    () => (data ?? []).filter((item: any) => Number(item.quantity) <= Number(item.min_threshold)),
    [data],
  );

  async function save() {
    if (!editor) return;
    const payload = {
      name: editor.name,
      quantity: editor.quantity,
      unit: editor.unit,
      min_threshold: editor.min_threshold,
      category: editor.category,
      unit_cost: editor.unit_cost,
    };
    try {
      if (editor.id) await supabase.from("inventory_items").update(payload).eq("id", editor.id);
      else await supabase.from("inventory_items").insert(payload);
      toast.success(ta.common.saved);
      setEditor(null);
      qc.invalidateQueries({ queryKey: ["inventory"] });
    } catch (e: any) { toast.error(e.message); }
  }

  async function applyScan() {
    const code = scanCode.trim().toLowerCase();
    if (!code) return;
    const item = (data ?? []).find((i: any) =>
      i.name?.toLowerCase().includes(code) || i.category?.toLowerCase().includes(code) || i.id === code,
    );
    if (!item) {
      toast.error("Produit introuvable — vérifiez le code ou le nom");
      return;
    }
    const newQty = Math.max(0, Number(item.quantity) + scanQty);
    const { error } = await supabase.from("inventory_items").update({ quantity: newQty }).eq("id", item.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`${item.name} : ${item.quantity} → ${newQty}`);
    setScanCode("");
    qc.invalidateQueries({ queryKey: ["inventory"] });
  }

  return (
    <AdminModuleLayout
      label={ta.stock.label}
      title={ta.stock.title}
      subtitle={ta.stock.subtitle}
      stats={[
        { label: ta.common.total, value: (data ?? []).length, Icon: Boxes },
        { label: ta.stock.threshold, value: lowStock.length, Icon: AlertTriangle, accent: lowStock.length > 0 },
      ]}
      actions={
        <Button variant="hero" size="sm" onClick={() => setEditor({ name: "", quantity: 0, unit: "unité", min_threshold: 5, category: "", unit_cost: 0 })}>
          <Plus className="mr-1 size-4" />{ta.common.add}
        </Button>
      }
      toolbar={
        <>
          <Link to="/admin/stock" search={{ tab: "inventory" }}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium ${tab === "inventory" ? "border-b-2 border-gold-deep text-gold-deep" : "text-muted-foreground"}`}>
            <Boxes className="mr-1 inline size-4" />{ta.stock.inventory}
          </Link>
          <Link to="/admin/stock" search={{ tab: "scan" }}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium ${tab === "scan" ? "border-b-2 border-gold-deep text-gold-deep" : "text-muted-foreground"}`}>
            <ScanLine className="mr-1 inline size-4" />{ta.stock.scan}
          </Link>
        </>
      }
    >
      {tab === "scan" ? (
        <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-8 shadow-sm">
          <ScanLine className="mx-auto size-12 text-gold-deep" />
          <h2 className="mt-4 text-center font-display text-2xl">Scan stock</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Saisissez le nom, la catégorie ou l'ID produit. Compatible lecteur code-barres USB (saisie clavier).
          </p>
          <div className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="text-muted-foreground">Code / nom produit</span>
              <input
                autoFocus
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void applyScan()}
                placeholder="Ex: Coca, Linge, uuid…"
                className="mt-1 w-full rounded-lg border px-4 py-3 text-lg"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Quantité (+ entrée / − sortie)</span>
              <input
                type="number"
                value={scanQty}
                onChange={(e) => setScanQty(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border px-4 py-3"
              />
            </label>
            <Button variant="hero" className="w-full" onClick={() => void applyScan()}>
              Valider le mouvement
            </Button>
          </div>
        </div>
      ) : (
        <>
          {lowStock.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <AlertTriangle className="size-5 shrink-0" />
              {lowStock.length} {ta.stock.lowStock}
            </div>
          )}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <table className="audit-table w-full text-sm">
              <thead className="bg-[#f8f6f1] text-left text-[11px] font-bold uppercase tracking-widest text-foreground/70">
                <tr>
                  <th className="p-3">{ta.stock.product}</th>
                  <th className="p-3">{ta.stock.qty}</th>
                  <th className="p-3">{ta.stock.threshold}</th>
                  <th className="p-3">{ta.finance.category}</th>
                  <th className="p-3">{ta.finance.amount}</th>
                  <th className="p-3 text-right">{ta.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">{ta.common.loading}</td></tr>
                ) : (data ?? []).map((item: any) => {
                  const low = Number(item.quantity) <= Number(item.min_threshold);
                  return (
                    <tr key={item.id} className={`border-t border-border/50 ${low ? "bg-amber-50/80" : ""}`}>
                      <td className="p-3 font-medium">
                        {low && <AlertTriangle className="mr-1 inline size-4 text-amber-600" />}
                        {item.name}
                      </td>
                      <td className="p-3 tabular-nums">{item.quantity} {item.unit}</td>
                      <td className="p-3 tabular-nums">{item.min_threshold}</td>
                      <td className="p-3 text-muted-foreground">{item.category || "—"}</td>
                      <td className="p-3">{formatXOF(Number(item.unit_cost ?? 0))}</td>
                      <td className="p-3 text-right">
                        <Button size="sm" variant="outline" onClick={() => setEditor(item)}>{ta.common.edit}</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-2xl">
            <h2 className="font-display text-xl">{editor.id ? ta.common.edit : ta.common.add}</h2>
            <div className="mt-4 space-y-3">
              {["name", "category", "unit"].map((k) => (
                <input key={k} placeholder={k} value={editor[k] ?? ""} onChange={(e) => setEditor({ ...editor, [k]: e.target.value })}
                  className="block w-full rounded-md border px-3 py-2 text-sm" />
              ))}
              {["quantity", "min_threshold", "unit_cost"].map((k) => (
                <input key={k} type="number" placeholder={k} value={editor[k] ?? 0} onChange={(e) => setEditor({ ...editor, [k]: Number(e.target.value) })}
                  className="block w-full rounded-md border px-3 py-2 text-sm" />
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="ghost" onClick={() => setEditor(null)}>{ta.common.cancel}</Button>
              <Button variant="hero" onClick={() => void save()}>{ta.common.save}</Button>
            </div>
          </div>
        </div>
      )}
    </AdminModuleLayout>
  );
}
