import { supabase } from "@/integrations/supabase/client";

export type TableStatus = "available" | "occupied" | "reserved" | "cleaning";
export type OrderStatus = "new" | "preparing" | "ready" | "served" | "paid" | "cancelled";

export const TABLE_STATUS_LABEL: Record<TableStatus, string> = {
  available: "Libre",
  occupied: "Occupée",
  reserved: "Réservée",
  cleaning: "Nettoyage",
};

export const TABLE_STATUS_BADGE: Record<TableStatus, string> = {
  available: "bg-emerald-100 text-emerald-800",
  occupied: "bg-rose-100 text-rose-800",
  reserved: "bg-violet-100 text-violet-800",
  cleaning: "bg-sky-100 text-sky-800",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Nouvelle",
  preparing: "En préparation",
  ready: "Prête",
  served: "Servie",
  paid: "Payée",
  cancelled: "Annulée",
};

export const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  new: "bg-amber-100 text-amber-800",
  preparing: "bg-orange-100 text-orange-800",
  ready: "bg-emerald-100 text-emerald-800",
  served: "bg-sky-100 text-sky-800",
  paid: "bg-slate-200 text-slate-700",
  cancelled: "bg-rose-100 text-rose-800",
};

export type MenuCategory = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
};

export type RestTable = {
  id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  location: string | null;
  is_active: boolean;
};

export type RestOrder = {
  id: string;
  reference: string;
  table_id: string | null;
  status: OrderStatus;
  guests_count: number;
  subtotal: number;
  total: number;
  payment_method: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  restaurant_tables: { number: string } | null;
  order_items: OrderLine[];
};

export type OrderLine = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  notes: string | null;
};

export async function fetchMenu() {
  const { data, error } = await supabase
    .from("menu_categories")
    .select("*, menu_items(*)")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((c: any) => ({
    ...c,
    menu_items: (c.menu_items ?? [])
      .filter((i: MenuItem) => i.is_available)
      .sort((a: MenuItem, b: MenuItem) => a.sort_order - b.sort_order),
  }));
}

export async function fetchAllMenuAdmin() {
  const { data, error } = await supabase
    .from("menu_categories")
    .select("*, menu_items(*)")
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function fetchTables() {
  const { data, error } = await supabase
    .from("restaurant_tables")
    .select("*")
    .eq("is_active", true)
    .order("number");
  if (error) throw error;
  return (data ?? []) as RestTable[];
}

export async function fetchActiveOrders() {
  const { data, error } = await supabase
    .from("restaurant_orders")
    .select("*, restaurant_tables(number), order_items(*)")
    .not("status", "in", '("paid","cancelled")')
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as RestOrder[];
}

export async function fetchKitchenOrders() {
  const { data, error } = await supabase
    .from("restaurant_orders")
    .select("*, restaurant_tables(number), order_items(*)")
    .in("status", ["new", "preparing", "ready"])
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as RestOrder[];
}

export async function createOrder(tableId: string | null, guestsCount = 1) {
  const { data, error } = await supabase
    .from("restaurant_orders")
    .insert({ table_id: tableId, guests_count: guestsCount, created_by: (await supabase.auth.getUser()).data.user?.id })
    .select("id")
    .single();
  if (error) throw error;
  if (tableId) {
    await supabase.from("restaurant_tables").update({ status: "occupied" }).eq("id", tableId);
  }
  return data.id as string;
}

export async function addOrderItem(orderId: string, item: MenuItem, qty = 1) {
  const lineTotal = Number(item.price) * qty;
  const { error } = await supabase.from("order_items").insert({
    order_id: orderId,
    menu_item_id: item.id,
    name: item.name,
    unit_price: item.price,
    quantity: qty,
    line_total: lineTotal,
  });
  if (error) throw error;
}

export async function updateOrderItemQty(lineId: string, qty: number, unitPrice: number) {
  if (qty <= 0) {
    const { error } = await supabase.from("order_items").delete().eq("id", lineId);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("order_items").update({
    quantity: qty,
    line_total: qty * unitPrice,
  }).eq("id", lineId);
  if (error) throw error;
}

export async function setOrderStatus(orderId: string, status: OrderStatus) {
  const { error } = await supabase.from("restaurant_orders").update({ status }).eq("id", orderId);
  if (error) throw error;
}

export async function payOrder(orderId: string, method: string, tableId: string | null) {
  const { error } = await supabase.from("restaurant_orders").update({
    status: "paid",
    payment_method: method,
    paid_at: new Date().toISOString(),
  }).eq("id", orderId);
  if (error) throw error;
  if (tableId) {
    await supabase.from("restaurant_tables").update({ status: "cleaning" }).eq("id", tableId);
  }
}

export async function setTableStatus(tableId: string, status: TableStatus) {
  const { error } = await supabase.from("restaurant_tables").update({ status }).eq("id", tableId);
  if (error) throw error;
}

export async function upsertCategory(id: string | null, name: string, sortOrder: number) {
  if (id) {
    const { error } = await supabase.from("menu_categories").update({ name, sort_order: sortOrder }).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("menu_categories").insert({ name, sort_order: sortOrder });
    if (error) throw error;
  }
}

export async function upsertMenuItem(payload: {
  id?: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  is_available: boolean;
}) {
  const row = {
    category_id: payload.category_id,
    name: payload.name,
    description: payload.description || null,
    price: payload.price,
    is_available: payload.is_available,
  };
  if (payload.id) {
    const { error } = await supabase.from("menu_items").update(row).eq("id", payload.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("menu_items").insert(row);
    if (error) throw error;
  }
}

export async function deleteMenuItem(id: string) {
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) throw error;
}
