import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatXOF } from "@/lib/rooms";
import { toast } from "sonner";
import { Plus, Minus, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/stock")({
  component: AdminStock,
});

function AdminStock() {
  const qc = useQueryClient();
  const [editor, setEditor] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory_items").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  async function save() {
    if (!editor) return;
    const payload = { name: editor.name, quantity: editor.quantity, unit: editor.unit, min_threshold: editor.min_threshold, category: editor.category, unit_cost: editor.unit_cost };
    try {
      if (editor.id) await supabase.from("inventory_items").update(payload).eq("id", editor.id);
      else await supabase.from("inventory_items").insert(payload);
      toast.success("Enregistré");
      setEditor(null);
      qc.invalidateQueries({ queryKey: ["inventory"] });
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="p-6 lg:p-10">
      <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Stock</span>
      <h1 className="mt-2 font-display text-4xl">Inventaire</h1>
      <Button className="mt-4" variant="hero" size="sm" onClick={() => setEditor({ name: "", quantity: 0, unit: "unité", min_threshold: 5, category: "", unit_cost: 0 })}>
        <Plus className="mr-1 size-4" />Ajouter
      </Button>
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Produit</th><th className="px-4 py-3">Qté</th><th className="px-4 py-3">Seuil</th><th className="px-4 py-3">Catégorie</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={5} className="p-8 text-center">Chargement…</td></tr> : (data ?? []).map((item: any) => {
              const low = Number(item.quantity) <= Number(item.min_threshold);
              return (
                <tr key={item.id} className={`border-t ${low ? "bg-amber-50" : ""}`}>
                  <td className="px-4 py-3">
                    {low && <AlertTriangle className="mr-1 inline size-4 text-amber-600" />}
                    {item.name}
                  </td>
                  <td className="px-4 py-3">{item.quantity} {item.unit}</td>
                  <td className="px-4 py-3">{item.min_threshold}</td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setEditor(item)}>Modifier</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {editor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6">
            <h2 className="font-display text-xl">{editor.id ? "Modifier" : "Nouveau"} produit</h2>
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
              <Button variant="ghost" onClick={() => setEditor(null)}>Annuler</Button>
              <Button variant="hero" onClick={save}>Enregistrer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
