import { supabase } from "@/integrations/supabase/client";

export type AuditEntry = {
  user_id?: string | null;
  action: string;
  module?: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, unknown>;
};

export type AuditFilters = {
  search?: string;
  user?: string;
  ip?: string;
  module?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
};

export type AuditLogRow = {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  module: string | null;
  entity_type: string | null;
  entity_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

/** Enregistre une entrée dans audit_logs (côté client authentifié). */
export async function logAudit(entry: AuditEntry) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("audit_logs").insert({
    user_id: user?.id ?? null,
    user_email: user?.email ?? null,
    action: entry.action,
    module: entry.module ?? null,
    entity_type: entry.entity_type ?? null,
    entity_id: entry.entity_id ?? null,
    ip_address: null,
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    details: entry.details ?? {},
  });
  if (error) console.warn("[audit]", error.message);
}

export async function fetchAuditLogs(limit = 100) {
  return fetchAuditLogsFiltered({ limit });
}

export async function fetchAuditLogsFiltered(filters: AuditFilters = {}): Promise<AuditLogRow[]> {
  const limit = filters.limit ?? 500;
  let q = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.module && filters.module !== "all") q = q.eq("module", filters.module);
  if (filters.action && filters.action !== "all") q = q.eq("action", filters.action);
  if (filters.entityType) q = q.ilike("entity_type", `%${filters.entityType}%`);
  if (filters.entityId) q = q.eq("entity_id", filters.entityId);
  if (filters.user) q = q.ilike("user_email", `%${filters.user}%`);
  if (filters.ip) q = q.ilike("ip_address", `%${filters.ip}%`);
  if (filters.dateFrom) q = q.gte("created_at", `${filters.dateFrom}T00:00:00`);
  if (filters.dateTo) q = q.lte("created_at", `${filters.dateTo}T23:59:59`);

  const { data, error } = await q;
  if (error) throw error;

  let rows = (data ?? []) as AuditLogRow[];
  if (filters.search) {
    const s = filters.search.toLowerCase();
    rows = rows.filter((r) =>
      `${r.action} ${r.module} ${r.user_email} ${r.entity_type} ${JSON.stringify(r.details)}`.toLowerCase().includes(s),
    );
  }
  return rows;
}

export async function fetchLoginHistory(userId?: string, limit = 100) {
  let q = supabase.from("login_history").select("*, profiles(full_name, email)").order("created_at", { ascending: false }).limit(limit);
  if (userId) q = q.eq("user_id", userId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function recordLogin(success = true) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("login_history").insert({
    user_id: user.id,
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    success,
  });
  await supabase.from("profiles").update({ last_login_at: new Date().toISOString() }).eq("id", user.id);
}

export function auditActionBadge(action: string): { label: string; className: string } {
  const a = action.toLowerCase();
  if (a.includes("delete") || a.includes("removed") || a.includes("suppr")) {
    return { label: "SUPPRESSION", className: "audit-badge audit-badge--danger" };
  }
  if (a.includes("create") || a.includes("insert") || a.includes("assigned")) {
    return { label: "CRÉATION", className: "audit-badge audit-badge--success" };
  }
  if (a.includes("update") || a.includes("modif") || a.includes("permissions")) {
    return { label: "MODIFICATION", className: "audit-badge audit-badge--info" };
  }
  if (a.includes("login") || a.includes("nav")) {
    return { label: "NAVIGATION", className: "audit-badge audit-badge--muted" };
  }
  if (a.includes("cancel")) {
    return { label: "ANNULATION", className: "audit-badge audit-badge--warning" };
  }
  return { label: action.replace(/_/g, " ").toUpperCase().slice(0, 16), className: "audit-badge audit-badge--muted" };
}

export const AUDIT_MODULES = [
  "all", "reservation", "role", "client", "finance", "room", "user", "conference", "event", "restaurant", "site",
] as const;

export const AUDIT_ACTIONS = [
  "all", "reservation_created", "reservation_updated", "permissions_updated", "role_assigned", "role_removed",
] as const;
