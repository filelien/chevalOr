import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { fetchPromoCodes, upsertPromoCode, deletePromoCode } from "@/lib/marketing";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/marketing")({
  component: AdminMarketing,
});

function AdminMarketing() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-promos"], queryFn: fetchPromoCodes });
  const [form, setForm] = useState({ code: "", title: "", discount_percent: 10, valid_until: "", is_active: true });

  async function save() {
    try {
      await upsertPromoCode({ ...form, valid_until: form.valid_until || null });
      toast.success("Code promo enregistré");
      setForm({ code: "", title: "", discount_percent: 10, valid_until: "", is_active: true });
      qc.invalidateQueries({ queryKey: ["admin-promos"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Marketing"
        title="Promotions & codes promo"
        subtitle="Gérez les réductions, campagnes et codes utilisables lors des réservations."
      />

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-display text-xl">Nouveau code promo</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input placeholder="Code (ex: ANIE20)" className="rounded-lg border border-input px-3 py-2.5 text-sm" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          <input placeholder="Titre" className="rounded-lg border border-input px-3 py-2.5 text-sm" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <input type="number" placeholder="%" className="rounded-lg border border-input px-3 py-2.5 text-sm" value={form.discount_percent} onChange={(e) => setForm((f) => ({ ...f, discount_percent: Number(e.target.value) }))} />
          <input type="date" className="rounded-lg border border-input px-3 py-2.5 text-sm" value={form.valid_until} onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))} />
        </div>
        <Button className="mt-4" variant="hero" onClick={save}><Plus className="mr-1 size-4" />Ajouter</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm divide-y divide-border">
        {data.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <span className="font-mono font-semibold text-gold-deep">{p.code}</span>
              <span className="ml-3 text-sm">{p.title}</span>
              <span className="ml-3 text-sm text-muted-foreground">-{p.discount_percent}%</span>
              {!p.is_active && <span className="ml-2 text-xs text-red-500">Inactif</span>}
            </div>
            <Button size="sm" variant="ghost" onClick={() => deletePromoCode(p.id).then(() => qc.invalidateQueries({ queryKey: ["admin-promos"] }))}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        <strong>Newsletter :</strong> consultez les abonnés dans <a href="/admin/messages" className="text-gold-deep underline">Messages → Newsletter</a>.
        Campagnes email automatisées : à connecter (SendGrid, Resend).
      </div>
    </div>
  );
}
