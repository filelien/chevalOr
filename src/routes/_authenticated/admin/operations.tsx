import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader, StatCard } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteOpsRow, fetchOpsRows, OPS_LABELS, type OpsModule, createOpsRow, updateOpsRow } from "@/lib/erp-ops";
import { Activity, Download, Hammer, LayoutGrid, List, Sparkles, Trash2 } from "lucide-react";
import { downloadCsv } from "@/lib/export-csv";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/_authenticated/admin/operations")({
  component: AdminOperationsPage,
});

const MODULES: OpsModule[] = [
  "spa_services",
  "spa_bookings",
  "bar_products",
  "bar_orders",
  "laundry_orders",
  "housekeeping_tasks",
  "maintenance_tickets",
];

function AdminOperationsPage() {
  const qc = useQueryClient();
  const [active, setActive] = useState<OpsModule>("spa_services");
  const [view, setView] = useState<"table" | "kanban">("table");
  const [draft, setDraft] = useState<Record<string, string>>({});

  const { data = [], isLoading } = useQuery({
    queryKey: ["ops-module", active],
    queryFn: () => fetchOpsRows(active),
  });

  const kpis = useMemo(() => {
    const total = data.length;
    const done = data.filter((r) => ["done", "paid", "resolved", "delivered", "validated", "closed"].includes(String(r.status))).length;
    const open = total - done;
    return { total, done, open };
  }, [data]);

  const statusChart = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of data) {
      const k = String(row.status || "n/a");
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [data]);

  const columns = useMemo(() => {
    const base = ["new", "scheduled", "received", "todo", "open", "in_progress", "ongoing", "done", "paid", "resolved", "closed"];
    const existing = Array.from(new Set(data.map((r) => String(r.status || "n/a"))));
    return base.filter((c) => existing.includes(c)).concat(existing.filter((e) => !base.includes(e)));
  }, [data]);

  async function addQuickRow() {
    try {
      const now = new Date().toISOString();
      const payloadByModule: Record<OpsModule, Record<string, any>> = {
        spa_services: { name: draft.name || "Nouveau service", category: draft.category || "massage", duration_min: Number(draft.duration_min || 60), price: Number(draft.price || 0) },
        spa_bookings: { customer_name: draft.customer_name || "Client", scheduled_at: draft.scheduled_at || now, status: draft.status || "scheduled" },
        bar_products: { name: draft.name || "Nouveau produit", category: draft.category || "cocktail", unit_price: Number(draft.unit_price || 0), stock_qty: Number(draft.stock_qty || 0) },
        bar_orders: { customer_name: draft.customer_name || "Client", total: Number(draft.total || 0), status: draft.status || "new" },
        laundry_orders: { customer_name: draft.customer_name || "Client", item_count: Number(draft.item_count || 1), total: Number(draft.total || 0), status: draft.status || "received" },
        housekeeping_tasks: { room_ref: draft.room_ref || "101", assigned_to: draft.assigned_to || "Equipe A", priority: draft.priority || "normal", status: draft.status || "todo" },
        maintenance_tickets: { title: draft.title || "Intervention", room_ref: draft.room_ref || "101", priority: draft.priority || "normal", status: draft.status || "open" },
      };
      await createOpsRow(active, payloadByModule[active]);
      setDraft({});
      toast.success("Enregistrement créé");
      qc.invalidateQueries({ queryKey: ["ops-module", active] });
    } catch (e: any) {
      toast.error(e.message || "Erreur de création");
    }
  }

  async function patchStatus(id: string, status: string) {
    try {
      await updateOpsRow(active, id, { status });
      qc.invalidateQueries({ queryKey: ["ops-module", active] });
    } catch (e: any) {
      toast.error(e.message || "Erreur de mise à jour");
    }
  }

  async function remove(id: string) {
    try {
      await deleteOpsRow(active, id);
      toast.success("Suppression effectuée");
      qc.invalidateQueries({ queryKey: ["ops-module", active] });
    } catch (e: any) {
      toast.error(e.message || "Erreur de suppression");
    }
  }

  function exportCurrent() {
    const headers = ["Code", "Description", "Status", "CreatedAt"];
    const rows = data.map((row) => [
      row.entity_code || row.id,
      row.name || row.title || row.customer_name || row.room_ref || "",
      row.status || "",
      row.created_at || "",
    ]);
    downloadCsv(`operations-${active}-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    toast.success("Export CSV généré");
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="ERP · Opérations"
        title="Operations 360"
        subtitle="Spa, Bar, Blanchisserie, Ménage, Maintenance — CRUD complets avec suivi d'activité."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total éléments" value={kpis.total} Icon={Activity} accent />
        <StatCard label="En cours / ouverts" value={kpis.open} Icon={Hammer} />
        <StatCard label="Terminés" value={kpis.done} Icon={Sparkles} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium">Répartition par statut</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#C9A227" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium">Actions rapides</p>
          <p className="mt-1 text-xs text-muted-foreground">Pilotez les opérations avec une vue tableau ou Kanban, puis exportez vos suivis.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant={view === "table" ? "hero" : "outline"} onClick={() => setView("table")}>
              <List className="mr-1 size-4" />Tableau
            </Button>
            <Button size="sm" variant={view === "kanban" ? "hero" : "outline"} onClick={() => setView("kanban")}>
              <LayoutGrid className="mr-1 size-4" />Kanban
            </Button>
            <Button size="sm" variant="outline" onClick={exportCurrent}>
              <Download className="mr-1 size-4" />Exporter CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {MODULES.map((m) => (
          <button
            key={m}
            onClick={() => setActive(m)}
            className={`rounded-lg px-3 py-2 text-sm ${active === m ? "bg-onyx text-white" : "bg-secondary text-foreground/70"}`}
          >
            {OPS_LABELS[m]}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Ajout rapide pour {OPS_LABELS[active]}</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <input className="rounded border px-3 py-2 text-sm" placeholder="Nom / Titre" value={draft.name || draft.title || ""} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value, title: e.target.value }))} />
          <input className="rounded border px-3 py-2 text-sm" placeholder="Client" value={draft.customer_name || ""} onChange={(e) => setDraft((d) => ({ ...d, customer_name: e.target.value }))} />
          <input className="rounded border px-3 py-2 text-sm" placeholder="Status" value={draft.status || ""} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))} />
          <input className="rounded border px-3 py-2 text-sm" placeholder="Salle / chambre (optionnel)" value={draft.room_ref || ""} onChange={(e) => setDraft((d) => ({ ...d, room_ref: e.target.value }))} />
          <input className="rounded border px-3 py-2 text-sm" placeholder="Catégorie" value={draft.category || ""} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} />
          <input className="rounded border px-3 py-2 text-sm" placeholder="Prix/Total" value={draft.total || draft.price || ""} onChange={(e) => setDraft((d) => ({ ...d, total: e.target.value, price: e.target.value }))} />
          <input className="rounded border px-3 py-2 text-sm" placeholder="Assigné à" value={draft.assigned_to || ""} onChange={(e) => setDraft((d) => ({ ...d, assigned_to: e.target.value }))} />
          <div className="md:col-span-2 lg:col-span-4">
            <Button size="sm" variant="hero" onClick={() => void addQuickRow()}>Ajouter</Button>
          </div>
        </div>
      </div>

      {view === "table" ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Créé le</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Chargement…</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Aucune donnée.</td></tr>
              ) : data.map((row) => (
                <tr key={row.id} className="border-t border-border/60">
                  <td className="px-3 py-2 font-mono text-xs">{row.entity_code || row.id.slice(0, 8)}</td>
                  <td className="px-3 py-2">{row.name || row.title || row.customer_name || row.room_ref || "—"}</td>
                  <td className="px-3 py-2">
                    <select
                      className="rounded border px-2 py-1 text-xs"
                      value={row.status || ""}
                      onChange={(e) => void patchStatus(row.id, e.target.value)}
                      disabled={!row.status}
                    >
                      <option value={row.status || ""}>{row.status || "n/a"}</option>
                      <option value="new">new</option>
                      <option value="in_progress">in_progress</option>
                      <option value="done">done</option>
                      <option value="resolved">resolved</option>
                      <option value="paid">paid</option>
                      <option value="closed">closed</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{String(row.created_at || "").slice(0, 10)}</td>
                  <td className="px-3 py-2">
                    <Button size="sm" variant="ghost" onClick={() => void remove(row.id)} className="text-destructive">
                      <Trash2 className="mr-1 size-3.5" />Supprimer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((col) => (
            <div key={col} className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col}</p>
              <div className="mt-3 space-y-2">
                {data.filter((r) => String(r.status || "n/a") === col).map((row) => (
                  <div key={row.id} className="rounded-lg border border-border/70 bg-secondary/20 p-3">
                    <p className="font-mono text-[11px] text-muted-foreground">{row.entity_code || row.id.slice(0, 8)}</p>
                    <p className="mt-1 text-sm font-medium">{row.name || row.title || row.customer_name || row.room_ref || "—"}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <select
                        className="rounded border px-2 py-1 text-[11px]"
                        value={row.status || ""}
                        onChange={(e) => void patchStatus(row.id, e.target.value)}
                        disabled={!row.status}
                      >
                        <option value={row.status || ""}>{row.status || "n/a"}</option>
                        <option value="new">new</option>
                        <option value="in_progress">in_progress</option>
                        <option value="done">done</option>
                        <option value="resolved">resolved</option>
                        <option value="paid">paid</option>
                        <option value="closed">closed</option>
                      </select>
                      <Button size="sm" variant="ghost" onClick={() => void remove(row.id)} className="text-destructive">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
