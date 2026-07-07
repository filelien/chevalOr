/**
 * Global Audit System
 * Audit trail centralisé pour tous les modules critiques avec supervision en temps réel
 */

import { supabase } from "@/integrations/supabase/client";

export type AuditAction = 
  // Réservations
  | "reservation.create" | "reservation.update" | "reservation.cancel" | "reservation.confirm"
  // Rooms
  | "room.create" | "room.update" | "room.delete" | "room.status_change"
  // Restaurant
  | "restaurant.order_create" | "restaurant.order_update" | "restaurant.order_cancel" | "restaurant.payment"
  // Finance
  | "finance.entry_create" | "finance.entry_update" | "finance.entry_delete" | "finance.payment_recorded"
  // Clients
  | "client.created" | "client.updated" | "client.deleted"
  // Staff
  | "staff.created" | "staff.updated" | "staff.deleted" | "staff.role_changed"
  // Stock
  | "stock.item_added" | "stock.quantity_changed" | "stock.item_removed"
  // Site
  | "site.page_updated" | "site.setting_changed" | "site.media_uploaded"
  // Auth
  | "auth.login" | "auth.logout" | "auth.password_changed" | "auth.2fa_enabled"
  // Reviews
  | "review.created" | "review.published" | "review.replied" | "review.deleted"
  // Avis
  | "avis.created" | "avis.updated" | "avis.published";

export type AuditLevel = "INFO" | "WARNING" | "CRITICAL" | "ERROR";

export type AuditEntry = {
  id?: string;
  timestamp?: string;
  user_id: string;
  user_email: string;
  action: AuditAction;
  module: string; // rooms, reservations, restaurant, finance, clients, staff, stock, site, auth, reviews
  level: AuditLevel;
  entity_type: string; // reservation, room, order, etc.
  entity_id: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
};

export type CriticalAlert = {
  id?: string;
  timestamp?: string;
  level: "CRITICAL" | "HIGH";
  type: string;
  message: string;
  module: string;
  user_email?: string;
  resolved: boolean;
  resolved_at?: string;
};

export type AuditStats = {
  total_entries: number;
  entries_today: number;
  entries_this_week: number;
  critical_alerts: number;
  active_users_today: number;
  modules_monitored: string[];
  last_entry: AuditEntry | null;
};

/**
 * Enregistre une action dans l'audit trail
 */
export async function logAuditEntry(entry: Omit<AuditEntry, "id" | "timestamp">): Promise<void> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entry.user_id);
    const { error } = await supabase.from("audit_logs").insert({
      user_id: isUuid ? entry.user_id : null,
      user_email: entry.user_email,
      action: entry.action,
      module: entry.module,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      details: entry.details ?? {},
    });
    if (error) throw error;
  } catch (err) {
    console.error("[global-audit] Erreur enregistrement:", err);
  }
}

/**
 * Déclenche une alerte critique
 */
export async function createCriticalAlert(
  level: "CRITICAL" | "HIGH",
  type: string,
  message: string,
  module: string,
  user_email?: string
): Promise<void> {
  try {
    const { error } = await supabase.from("critical_alerts").insert({
      level,
      type,
      message,
      module,
      user_email,
      resolved: false,
      timestamp: new Date().toISOString(),
    });

    if (error) throw error;

    // TODO: Envoyer notification en temps réel via websocket/pusher
    console.warn(`[CRITICAL ALERT] ${type}: ${message}`);
  } catch (err) {
    console.error("[global-audit] Erreur alerte:", err);
  }
}

/**
 * Récupère les alertes critiques non résolues
 */
export async function fetchCriticalAlerts(): Promise<CriticalAlert[]> {
  try {
    const { data, error } = await supabase
      .from("critical_alerts")
      .select("*")
      .eq("resolved", false)
      .order("timestamp", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error("[global-audit] Erreur fetch alertes:", err);
    return [];
  }
}

/**
 * Résout une alerte critique
 */
export async function resolveCriticalAlert(alertId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("critical_alerts")
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq("id", alertId);

    if (error) throw error;
  } catch (err) {
    console.error("[global-audit] Erreur resolve alerte:", err);
    throw err;
  }
}

/**
 * Récupère les statistiques d'audit
 */
export async function fetchAuditStats(): Promise<AuditStats> {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: totalCount },
      { data: todayData },
      { data: weekData },
      { count: alertCount },
      { data: usersData },
      { data: lastEntry },
    ] = await Promise.all([
      supabase.from("audit_logs").select("*", { count: "exact", head: true }),
      supabase.from("audit_logs").select("*").gte("timestamp", today),
      supabase.from("audit_logs").select("*").gte("timestamp", weekAgo),
      supabase.from("critical_alerts").select("*", { count: "exact", head: true }).eq("resolved", false),
      supabase.from("audit_logs").select("DISTINCT user_id").gte("timestamp", today),
      supabase.from("audit_logs").select("*").order("timestamp", { ascending: false }).limit(1),
    ]);

    // Extraire les modules uniques
    const modules = new Set<string>();
    const modulesArray = [
      "rooms",
      "reservations",
      "restaurant",
      "finance",
      "clients",
      "staff",
      "stock",
      "site",
      "auth",
      "reviews",
    ];

    return {
      total_entries: totalCount ?? 0,
      entries_today: todayData?.length ?? 0,
      entries_this_week: weekData?.length ?? 0,
      critical_alerts: alertCount ?? 0,
      active_users_today: usersData?.length ?? 0,
      modules_monitored: modulesArray,
      last_entry: lastEntry?.[0] ?? null,
    };
  } catch (err) {
    console.error("[global-audit] Erreur stats:", err);
    return {
      total_entries: 0,
      entries_today: 0,
      entries_this_week: 0,
      critical_alerts: 0,
      active_users_today: 0,
      modules_monitored: [],
      last_entry: null,
    };
  }
}

/**
 * Récupère l'audit trail avec filtres
 */
export async function fetchAuditTrail(filters?: {
  module?: string;
  action?: AuditAction;
  user_id?: string;
  from_date?: string;
  to_date?: string;
  level?: AuditLevel;
  limit?: number;
}): Promise<AuditEntry[]> {
  try {
    let query = supabase.from("audit_logs").select("*");

    if (filters?.module) query = query.eq("module", filters.module);
    if (filters?.action) query = query.eq("action", filters.action);
    if (filters?.user_id) query = query.eq("user_id", filters.user_id);
    if (filters?.level) query = query.eq("level", filters.level);
    if (filters?.from_date) query = query.gte("timestamp", filters.from_date);
    if (filters?.to_date) query = query.lte("timestamp", filters.to_date);

    const { data, error } = await query
      .order("timestamp", { ascending: false })
      .limit(filters?.limit ?? 100);

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error("[global-audit] Erreur trail:", err);
    return [];
  }
}

/**
 * Utilités pour logger depuis n'importe quel module
 */
export const auditLog = {
  reservation: (action: "create" | "update" | "cancel" | "confirm", entityId: string, details: any, userEmail: string) =>
    logAuditEntry({
      user_id: userEmail.split("@")[0],
      user_email: userEmail,
      action: `reservation.${action}` as AuditAction,
      module: "reservations",
      level: action === "cancel" ? "WARNING" : "INFO",
      entity_type: "reservation",
      entity_id: entityId,
      details,
    }),

  room: (action: "create" | "update" | "delete" | "status_change", entityId: string, details: any, userEmail: string) =>
    logAuditEntry({
      user_id: userEmail.split("@")[0],
      user_email: userEmail,
      action: `room.${action}` as AuditAction,
      module: "rooms",
      level: "INFO",
      entity_type: "room",
      entity_id: entityId,
      details,
    }),

  finance: (action: "entry_create" | "entry_update" | "entry_delete" | "payment_recorded", entityId: string, details: any, userEmail: string) =>
    logAuditEntry({
      user_id: userEmail.split("@")[0],
      user_email: userEmail,
      action: `finance.${action}` as AuditAction,
      module: "finance",
      level: action === "entry_delete" ? "WARNING" : "INFO",
      entity_type: "financial_record",
      entity_id: entityId,
      details,
    }),

  stock: (action: "item_added" | "quantity_changed" | "item_removed", entityId: string, details: any, userEmail: string) =>
    logAuditEntry({
      user_id: userEmail.split("@")[0],
      user_email: userEmail,
      action: `stock.${action}` as AuditAction,
      module: "stock",
      level: action === "item_removed" ? "WARNING" : "INFO",
      entity_type: "inventory_item",
      entity_id: entityId,
      details,
    }),

  auth: (action: "login" | "logout" | "password_changed" | "2fa_enabled", userEmail: string, details: any) =>
    logAuditEntry({
      user_id: userEmail.split("@")[0],
      user_email: userEmail,
      action: `auth.${action}` as AuditAction,
      module: "auth",
      level: "INFO",
      entity_type: "user",
      entity_id: userEmail,
      details,
    }),
};
