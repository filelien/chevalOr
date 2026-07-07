import { supabase } from "@/integrations/supabase/client";

export type OpsModule =
  | "spa_services"
  | "spa_bookings"
  | "bar_products"
  | "bar_orders"
  | "laundry_orders"
  | "housekeeping_tasks"
  | "maintenance_tickets";

export const OPS_LABELS: Record<OpsModule, string> = {
  spa_services: "Services spa",
  spa_bookings: "Réservations spa",
  bar_products: "Produits bar",
  bar_orders: "Commandes bar",
  laundry_orders: "Blanchisserie",
  housekeeping_tasks: "Ménage",
  maintenance_tickets: "Maintenance",
};

export async function fetchOpsRows(module: OpsModule) {
  const { data, error } = await (supabase as any)
    .from(module)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as Record<string, any>[];
}

export async function createOpsRow(module: OpsModule, payload: Record<string, any>) {
  const { error } = await (supabase as any).from(module).insert(payload);
  if (error) throw error;
}

export async function updateOpsRow(module: OpsModule, id: string, payload: Record<string, any>) {
  const { error } = await (supabase as any).from(module).update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteOpsRow(module: OpsModule, id: string) {
  const { error } = await (supabase as any).from(module).delete().eq("id", id);
  if (error) throw error;
}
