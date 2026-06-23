import { supabase } from "@/integrations/supabase/client";

export type AuditEntry = {
  user_id?: string | null;
  action: string;
  module?: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, unknown>;
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
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchLoginHistory(userId?: string, limit = 50) {
  let q = supabase.from("login_history").select("*").order("created_at", { ascending: false }).limit(limit);
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
