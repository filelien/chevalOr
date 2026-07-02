import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "reservation_created"
  | "reservation_updated"
  | "reservation_cancelled"
  | "payment_recorded"
  | "room_updated"
  | "review_created"
  | "review_published"
  | "review_archived"
  | "order_created"
  | "order_completed"
  | "inventory_updated"
  | "user_created"
  | "user_updated"
  | "user_role_changed"
  | "permissions_updated"
  | "accounting_entry_posted"
  | "accounting_entry_cancelled"
  | "export_generated"
  | "login"
  | "logout"
  | "settings_changed";

export type AuditLogRow = {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: AuditAction;
  module: string;
  entity_type: string;
  entity_id: string | null;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  changes_summary?: string | null;
  ip_address: string | null;
  user_agent: string | null;
  country: string | null;
  severity: "critical" | "warning" | "info";
  details: Record<string, unknown> | null;
  created_at: string;
};

export type AuditAlert = {
  id: string;
  severity: "critical" | "warning";
  title: string;
  description: string;
  action: AuditAction;
  timestamp: string;
};

export const ACTION_LABELS: Record<AuditAction, { label: string; icon: string }> = {
  reservation_created: { label: "Réservation créée", icon: "plus" },
  reservation_updated: { label: "Réservation mise à jour", icon: "edit" },
  reservation_cancelled: { label: "Réservation annulée", icon: "trash" },
  payment_recorded: { label: "Paiement enregistré", icon: "credit-card" },
  room_updated: { label: "Chambre mise à jour", icon: "edit" },
  review_created: { label: "Avis créé", icon: "plus" },
  review_published: { label: "Avis publié", icon: "send" },
  review_archived: { label: "Avis archivé", icon: "archive" },
  order_created: { label: "Commande créée", icon: "plus" },
  order_completed: { label: "Commande complétée", icon: "check" },
  inventory_updated: { label: "Inventaire mis à jour", icon: "edit" },
  user_created: { label: "Utilisateur créé", icon: "plus" },
  user_updated: { label: "Utilisateur mis à jour", icon: "edit" },
  user_role_changed: { label: "Rôle utilisateur changé", icon: "shield" },
  permissions_updated: { label: "Permissions mises à jour", icon: "lock" },
  accounting_entry_posted: { label: "Écriture comptable enregistrée", icon: "check" },
  accounting_entry_cancelled: { label: "Écriture comptable annulée", icon: "trash" },
  export_generated: { label: "Export généré", icon: "download" },
  login: { label: "Connexion", icon: "log-in" },
  logout: { label: "Déconnexion", icon: "log-out" },
  settings_changed: { label: "Paramètres changés", icon: "settings" },
};

/** Enregistre une action dans l'audit. */
export async function logAuditAction(entry: {
  action: AuditAction;
  module: string;
  entity_type: string;
  entity_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  changes_summary?: string;
  details?: Record<string, unknown>;
  severity?: "critical" | "warning" | "info";
}) {
  const { data: { user } } = await supabase.auth.getUser();

  const payload = {
    user_id: user?.id ?? null,
    user_email: user?.email ?? null,
    action: entry.action,
    module: entry.module,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id ?? null,
    old_values: entry.old_values ?? null,
    new_values: entry.new_values ?? null,
    changes_summary: entry.changes_summary ?? null,
    ip_address: typeof window !== "undefined" ? (window.clientIp ?? null) : null,
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    country: null, // À remplir avec géolocalisation
    severity: entry.severity ?? "info",
    details: entry.details ?? null,
  };

  const { error } = await supabase.from("audit_logs").insert(payload);
  if (error) console.warn("[audit]", error.message);
}

/** Récupère les logs d'audit filtrés. */
export async function fetchAuditLogs(filters: {
  module?: string;
  action?: AuditAction;
  user?: string;
  entity_type?: string;
  severity?: "critical" | "warning" | "info";
  fromDate?: string;
  toDate?: string;
  limit?: number;
}) {
  const limit = filters.limit ?? 500;
  let q = supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(limit);

  if (filters.module) q = q.eq("module", filters.module);
  if (filters.action) q = q.eq("action", filters.action);
  if (filters.user) q = q.ilike("user_email", `%${filters.user}%`);
  if (filters.entity_type) q = q.eq("entity_type", filters.entity_type);
  if (filters.severity) q = q.eq("severity", filters.severity);
  if (filters.fromDate) q = q.gte("created_at", `${filters.fromDate}T00:00:00`);
  if (filters.toDate) q = q.lte("created_at", `${filters.toDate}T23:59:59`);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as AuditLogRow[];
}

/** Récupère les alertes critiques récentes. */
export async function fetchRecentAlerts(hours = 24): Promise<AuditAlert[]> {
  const since = new Date();
  since.setHours(since.getHours() - hours);

  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, action, severity, changes_summary, created_at")
    .in("severity", ["critical", "warning"])
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  return (data ?? []).map((log) => ({
    id: log.id,
    severity: log.severity as "critical" | "warning",
    title: ACTION_LABELS[log.action as AuditAction]?.label ?? log.action,
    description: log.changes_summary ?? "Action effectuée",
    action: log.action as AuditAction,
    timestamp: log.created_at,
  }));
}

/** Génère un rapport d'audit pour une période. */
export async function generateAuditReport(fromDate: string, toDate: string) {
  const logs = await fetchAuditLogs({ fromDate, toDate, limit: 5000 });

  const byAction = Object.entries(
    logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([action, count]) => ({ action, count }));

  const byUser = Object.entries(
    logs.reduce((acc, log) => {
      const email = log.user_email ?? "Système";
      acc[email] = (acc[email] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([user, count]) => ({ user, count }))
    .sort((a, b) => b.count - a.count);

  const byModule = Object.entries(
    logs.reduce((acc, log) => {
      acc[log.module] = (acc[log.module] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([module, count]) => ({ module, count }));

  const criticalCount = logs.filter((l) => l.severity === "critical").length;
  const warningCount = logs.filter((l) => l.severity === "warning").length;

  return {
    period: { from: fromDate, to: toDate },
    totalEvents: logs.length,
    criticalEvents: criticalCount,
    warningEvents: warningCount,
    byAction,
    byUser,
    byModule,
  };
}
