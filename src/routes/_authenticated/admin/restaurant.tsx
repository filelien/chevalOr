import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatXOF } from "@/lib/rooms";
import {
  addOrderItem, createOrder, fetchActiveOrders, fetchAllMenuAdmin, fetchKitchenOrders,
  fetchTables, ORDER_STATUS_BADGE, ORDER_STATUS_LABEL, payOrder, setOrderStatus,
  setTableStatus, TABLE_STATUS_BADGE, TABLE_STATUS_LABEL, updateOrderItemQty,
  upsertMenuItem, deleteMenuItem,
  type MenuItem, type OrderStatus, type RestOrder, type RestTable,
} from "@/lib/restaurant";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Plus, Minus, ChefHat, LayoutGrid, UtensilsCrossed, Send, Receipt } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/restaurant")({
  component: AdminRestaurant,
});

type Tab = "tables" | "orders" | "kitchen" | "menu";

function AdminRestaurant() {
  const [tab, setTab] = useState<Tab>("tables");
  const { hasAnyRole } = useAuth();
  const canEditMenu = hasAnyRole(["super_admin", "manager"]);

  const tabs: { id: Tab; label: string; Icon: typeof LayoutGrid }[] = [
    { id: "tables", label: "Tables", Icon: LayoutGrid },
    { id: "orders", label: "Commandes", Icon: UtensilsCrossed },
    { id: "kitchen", label: "Cuisine", Icon: ChefHat },
    { id: "menu", label: "Menu", Icon: UtensilsCrossed },
  ];

  return (
    <div className="p-6 lg:p-10">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Module 2</span>
        <h1 className="mt-2 font-display text-4xl">Restaurant POS</h1>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${tab === id ? "bg-onyx text-white" : "bg-secondary text-foreground/70 hover:bg-secondary/80"}`}>
            <Icon className="size-4" />{label}
          </button>
        ))}
      </div>

      {tab === "tables" && <TablesTab />}
      {tab === "orders" && <OrdersTab />}
      {tab === "kitchen" && <KitchenTab />}
      {tab === "menu" && <MenuTab canEdit={canEditMenu} />}
    </div>
  );
}

function TablesTab() {
  const qc = useQueryClient();
  const [activeOrder, setActiveOrder] = useState<string | null>(null);
  const [activeTable, setActiveTable] = useState<RestTable | null>(null);

  const { data: tables, isLoading } = useQuery({ queryKey: ["rest-tables"], queryFn: fetchTables });
  const { data: menu } = useQuery({ queryKey: ["rest-menu"], queryFn: fetchAllMenuAdmin });
  const { data: order } = useQuery({
    queryKey: ["rest-order", activeOrder],
    enabled: !!activeOrder,
    queryFn: async () => {
      const { data } = await supabase
        .from("restaurant_orders")
        .select("*, order_items(*), restaurant_tables(number)")
        .eq("id", activeOrder!)
        .maybeSingle();
      return data as RestOrder | null;
    },
  });

  async function openTable(table: RestTable) {
    if (table.status === "occupied") {
      const { data } = await supabase
        .from("restaurant_orders")
        .select("id")
        .eq("table_id", table.id)
        .not("status", "in", '("paid","cancelled")')
        .maybeSingle();
      if (data) { setActiveOrder(data.id); setActiveTable(table); return; }
    }
    try {
      const id = await createOrder(table.id);
      setActiveOrder(id);
      setActiveTable(table);
      qc.invalidateQueries({ queryKey: ["rest-tables"] });
      toast.success(`Commande ouverte · ${table.number}`);
    } catch (e: any) { toast.error(e.message); }
  }

  async function addItem(item: MenuItem) {
    if (!activeOrder) return;
    try {
      await addOrderItem(activeOrder, item);
      qc.invalidateQueries({ queryKey: ["rest-order", activeOrder] });
      toast.success(`${item.name} ajouté`);
    } catch (e: any) { toast.error(e.message); }
  }

  async function changeQty(lineId: string, qty: number, unitPrice: number) {
    if (!activeOrder) return;
    try {
      await updateOrderItemQty(lineId, qty, unitPrice);
      qc.invalidateQueries({ queryKey: ["rest-order", activeOrder] });
    } catch (e: any) { toast.error(e.message); }
  }

  async function sendKitchen() {
    if (!activeOrder) return;
    try {
      await setOrderStatus(activeOrder, "preparing");
      toast.success("Envoyé en cuisine");
      qc.invalidateQueries({ queryKey: ["rest-order", activeOrder] });
    } catch (e: any) { toast.error(e.message); }
  }

  async function pay(method: string) {
    if (!activeOrder || !activeTable) return;
    try {
      await payOrder(activeOrder, method, activeTable.id);
      toast.success("Commande payée");
      setActiveOrder(null);
      setActiveTable(null);
      qc.invalidateQueries({ queryKey: ["rest-tables"] });
    } catch (e: any) { toast.error(e.message); }
  }

  async function freeTable(tableId: string) {
    try {
      await setTableStatus(tableId, "available");
      qc.invalidateQueries({ queryKey: ["rest-tables"] });
      toast.success("Table libérée");
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div>
        <h2 className="font-display text-xl">Plan de salle</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {isLoading ? (
            <p className="text-muted-foreground">Chargement…</p>
          ) : (tables ?? []).map((t) => (
            <button key={t.id} onClick={() => openTable(t)}
              className={`rounded-xl border p-4 text-left transition hover:border-gold ${t.status === "occupied" ? "border-rose-300 bg-rose-50" : "border-border bg-card"}`}>
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl">{t.number}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${TABLE_STATUS_BADGE[t.status]}`}>{TABLE_STATUS_LABEL[t.status]}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t.capacity} pers. · {t.location}</p>
              {t.status === "cleaning" && (
                <Button size="sm" variant="outline" className="mt-2 w-full text-xs" onClick={(e) => { e.stopPropagation(); freeTable(t.id); }}>
                  Marquer libre
                </Button>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        {activeOrder && order ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">Commande {order.reference}</h2>
              <span className={`rounded-full px-2 py-0.5 text-xs ${ORDER_STATUS_BADGE[order.status]}`}>{ORDER_STATUS_LABEL[order.status]}</span>
            </div>
            <p className="text-sm text-muted-foreground">Table {order.restaurant_tables?.number ?? "—"}</p>

            <ul className="mt-4 space-y-2">
              {(order.order_items ?? []).map((line) => (
                <li key={line.id} className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                  <div>
                    <div className="font-medium">{line.name}</div>
                    <div className="text-xs text-muted-foreground">{formatXOF(Number(line.unit_price))}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded border p-1" onClick={() => changeQty(line.id, line.quantity - 1, Number(line.unit_price))}><Minus className="size-3" /></button>
                    <span className="w-6 text-center text-sm">{line.quantity}</span>
                    <button className="rounded border p-1" onClick={() => changeQty(line.id, line.quantity + 1, Number(line.unit_price))}><Plus className="size-3" /></button>
                    <span className="w-20 text-right text-sm font-medium">{formatXOF(Number(line.line_total))}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span className="font-display text-lg">Total</span>
              <span className="font-display text-xl text-gold-deep">{formatXOF(Number(order.total))}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {order.status === "new" && (
                <Button variant="hero" size="sm" onClick={sendKitchen}><Send className="mr-1 size-4" />Cuisine</Button>
              )}
              {order.status !== "paid" && (
                <>
                  <Button variant="outline" size="sm" onClick={() => pay("Espèces")}><Receipt className="mr-1 size-4" />Espèces</Button>
                  <Button variant="outline" size="sm" onClick={() => pay("Mobile Money")}>Mobile Money</Button>
                  <Button variant="outline" size="sm" onClick={() => pay("Carte bancaire")}>Carte</Button>
                </>
              )}
            </div>

            <div className="mt-6 max-h-64 overflow-y-auto">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Ajouter au menu</p>
              {(menu ?? []).map((cat: any) => (
                <div key={cat.id} className="mt-3">
                  <p className="text-sm font-medium">{cat.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(cat.menu_items ?? []).filter((i: MenuItem) => i.is_available).map((item: MenuItem) => (
                      <button key={item.id} onClick={() => addItem(item)}
                        className="rounded-md border border-border px-2 py-1 text-xs hover:border-gold">
                        {item.name} · {formatXOF(Number(item.price))}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="py-12 text-center text-muted-foreground">Sélectionnez une table pour ouvrir une commande.</p>
        )}
      </div>
    </div>
  );
}

function OrdersTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["rest-orders"], queryFn: fetchActiveOrders });

  const stats = {
    total: data?.length ?? 0,
    new: data?.filter((o) => o.status === "new").length ?? 0,
    preparing: data?.filter((o) => o.status === "preparing").length ?? 0,
    revenue: data?.filter((o) => o.status === "paid").reduce((s, o) => s + Number(o.total), 0) ?? 0,
  };

  async function setStatus(id: string, status: OrderStatus) {
    try {
      await setOrderStatus(id, status);
      qc.invalidateQueries({ queryKey: ["rest-orders"] });
      toast.success("Statut mis à jour");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Commandes actives", value: stats.total, color: "from-amber-500/10" },
          { label: "Nouvelles", value: stats.new, color: "from-orange-500/10" },
          { label: "En cuisine", value: stats.preparing, color: "from-rose-500/10" },
          { label: "CA encaissé", value: formatXOF(stats.revenue), color: "from-emerald-500/10" },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-xl border border-border bg-gradient-to-br ${kpi.color} to-card p-4 shadow-sm`}>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 font-display text-2xl">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Réf. / Code</th>
              <th className="px-4 py-3">Table</th>
              <th className="px-4 py-3">Articles</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Chargement…</td></tr>
            ) : (data ?? []).length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Aucune commande active.</td></tr>
            ) : (data ?? []).map((o) => (
              <tr key={o.id} className="border-t border-border/60 transition hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <p className="font-mono text-xs font-medium">{o.reference}</p>
                  {(o as { entity_code?: string }).entity_code && (
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{(o as { entity_code?: string }).entity_code}</p>
                  )}
                </td>
              <td className="px-4 py-3">{o.restaurant_tables?.number ?? "—"}</td>
              <td className="px-4 py-3 text-xs">{(o.order_items ?? []).map((i) => `${i.quantity}× ${i.name}`).join(", ")}</td>
              <td className="px-4 py-3 font-medium text-gold-deep">{formatXOF(Number(o.total))}</td>
              <td className="px-4 py-3">
                <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
                  className={`rounded-full px-2 py-1 text-xs ${ORDER_STATUS_BADGE[o.status]}`}>
                  {(["new", "preparing", "ready", "served", "paid", "cancelled"] as OrderStatus[]).map((s) => (
                    <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function KitchenTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["rest-kitchen"], queryFn: fetchKitchenOrders, refetchInterval: 15000 });

  async function setStatus(id: string, status: OrderStatus) {
    try {
      await setOrderStatus(id, status);
      qc.invalidateQueries({ queryKey: ["rest-kitchen"] });
      toast.success("Mis à jour");
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {isLoading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : (data ?? []).length === 0 ? (
        <p className="text-muted-foreground">Aucune commande en cuisine.</p>
      ) : (data ?? []).map((o) => (
        <div key={o.id} className={`rounded-xl border p-4 ${o.status === "new" ? "border-amber-400 bg-amber-50" : o.status === "preparing" ? "border-orange-400 bg-orange-50" : "border-emerald-400 bg-emerald-50"}`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm">{o.reference}</span>
            <span className="text-sm">Table {o.restaurant_tables?.number ?? "—"}</span>
          </div>
          <ul className="mt-3 space-y-1">
            {(o.order_items ?? []).map((i) => (
              <li key={i.id} className="text-sm"><strong>{i.quantity}×</strong> {i.name}</li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            {o.status === "new" && <Button size="sm" onClick={() => setStatus(o.id, "preparing")}>Préparer</Button>}
            {o.status === "preparing" && <Button size="sm" onClick={() => setStatus(o.id, "ready")}>Prête</Button>}
            {o.status === "ready" && <Button size="sm" onClick={() => setStatus(o.id, "served")}>Servie</Button>}
          </div>
        </div>
      ))}
    </div>
  );
}

function MenuTab({ canEdit }: { canEdit: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["rest-menu-admin"], queryFn: fetchAllMenuAdmin });
  const [editor, setEditor] = useState<{ id?: string; category_id: string; name: string; description: string; price: number; is_available: boolean } | null>(null);

  async function save() {
    if (!editor) return;
    try {
      await upsertMenuItem(editor);
      toast.success("Plat enregistré");
      setEditor(null);
      qc.invalidateQueries({ queryKey: ["rest-menu-admin"] });
      qc.invalidateQueries({ queryKey: ["rest-menu"] });
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="mt-6">
      {!canEdit && <p className="mb-4 text-sm text-muted-foreground">Lecture seule — seuls les managers peuvent modifier le menu.</p>}
      {isLoading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : (data ?? []).map((cat: any) => (
        <div key={cat.id} className="mb-8">
          <h2 className="font-display text-xl">{cat.name}</h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
                <tr><th className="px-4 py-2">Plat</th><th className="px-4 py-2">Prix</th><th className="px-4 py-2">Dispo</th>{canEdit && <th className="px-4 py-2" />}</tr>
              </thead>
              <tbody>
                {(cat.menu_items ?? []).sort((a: MenuItem, b: MenuItem) => a.sort_order - b.sort_order).map((item: MenuItem) => (
                  <tr key={item.id} className="border-t border-border/60">
                    <td className="px-4 py-2"><div>{item.name}</div><div className="text-xs text-muted-foreground">{item.description}</div></td>
                    <td className="px-4 py-2">{formatXOF(Number(item.price))}</td>
                    <td className="px-4 py-2">{item.is_available ? "Oui" : "Non"}</td>
                    {canEdit && (
                      <td className="px-4 py-2 text-right">
                        <Button size="sm" variant="ghost" onClick={() => setEditor({ id: item.id, category_id: cat.id, name: item.name, description: item.description ?? "", price: Number(item.price), is_available: item.is_available })}>Modifier</Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => { await deleteMenuItem(item.id); qc.invalidateQueries({ queryKey: ["rest-menu-admin"] }); toast.success("Supprimé"); }}>Suppr.</Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {canEdit && (
            <Button size="sm" variant="outline" className="mt-2" onClick={() => setEditor({ category_id: cat.id, name: "", description: "", price: 5000, is_available: true })}>
              <Plus className="mr-1 size-4" />Ajouter un plat
            </Button>
          )}
        </div>
      ))}

      {editor && (
        <Dialog open onOpenChange={(o) => !o && setEditor(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editor.id ? "Modifier" : "Nouveau"} plat</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <label className="block text-xs uppercase text-muted-foreground">Nom
                <input value={editor.name} onChange={(e) => setEditor({ ...editor, name: e.target.value })} className="mt-1 block w-full rounded-md border border-input px-3 py-2 text-sm" />
              </label>
              <label className="block text-xs uppercase text-muted-foreground">Description
                <textarea value={editor.description} onChange={(e) => setEditor({ ...editor, description: e.target.value })} className="mt-1 block w-full rounded-md border border-input px-3 py-2 text-sm" rows={2} />
              </label>
              <label className="block text-xs uppercase text-muted-foreground">Prix (XOF)
                <input type="number" value={editor.price} onChange={(e) => setEditor({ ...editor, price: Number(e.target.value) })} className="mt-1 block w-full rounded-md border border-input px-3 py-2 text-sm" />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editor.is_available} onChange={(e) => setEditor({ ...editor, is_available: e.target.checked })} />
                Disponible
              </label>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditor(null)}>Annuler</Button>
              <Button variant="hero" onClick={save}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
