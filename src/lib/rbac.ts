import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/auth";
import type { PermissionKey } from "@/lib/permissions";
import { PERMISSION_LABELS } from "@/lib/permissions";

/** Permissions par défaut si la RPC Supabase n'est pas encore disponible. */
export const DEFAULT_ROLE_PERMISSIONS: Record<AppRole, PermissionKey[]> = {
  super_admin: Object.keys(PERMISSION_LABELS) as PermissionKey[],
  manager: [
    "dashboard.view", "reservation.view", "reservation.create", "reservation.edit", "reservation.cancel", "reservation.export",
    "room.view", "room.edit", "client.view", "client.create", "client.edit", "client.export",
    "conference.view", "conference.manage", "event.view", "event.manage",
    "restaurant.view", "restaurant.manage", "stock.view", "stock.manage",
    "staff.view", "staff.manage", "finance.view", "finance.create", "finance.edit", "finance.export",
    "payment.view", "payment.manage", "report.view", "report.export",
    "marketing.view", "marketing.manage", "review.view", "review.manage",
    "message.view", "message.manage", "site.view", "site.manage", "gallery.view", "gallery.manage",
    "seo.view", "seo.manage", "settings.view", "settings.edit", "audit.view", "notification.view",
  ],
  reception: [
    "dashboard.view", "reservation.view", "reservation.create", "reservation.edit", "reservation.cancel",
    "room.view", "client.view", "client.create", "client.edit", "conference.view", "conference.manage",
    "event.view", "review.view", "review.manage", "message.view", "message.manage", "payment.view", "payment.manage", "notification.view",
  ],
  restaurant_staff: ["dashboard.view", "restaurant.view", "restaurant.manage", "message.view", "message.manage", "notification.view"],
  accountant: ["dashboard.view", "finance.view", "finance.create", "finance.edit", "finance.export", "payment.view", "payment.manage", "report.view", "report.export", "notification.view"],
  cleaning_staff: ["dashboard.view", "room.view", "notification.view"],
  customer: [],
};

export function permissionsFromRoles(roles: AppRole[]): PermissionKey[] {
  const set = new Set<PermissionKey>();
  for (const role of roles) {
    for (const p of DEFAULT_ROLE_PERMISSIONS[role] ?? []) set.add(p);
  }
  return [...set];
}

export async function fetchUserPermissions(userId: string, roles?: AppRole[]): Promise<PermissionKey[]> {
  const { data, error } = await supabase.rpc("get_user_permissions", { _user_id: userId });
  if (!error && data?.length) return data as PermissionKey[];
  if (roles?.length) return permissionsFromRoles(roles);
  return [];
}

export async function fetchRolePermissions(role: AppRole): Promise<PermissionKey[]> {
  const { data, error } = await supabase
    .from("role_permissions")
    .select("permission_key")
    .eq("role", role);
  if (error) throw error;
  return (data ?? []).map((r) => r.permission_key as PermissionKey);
}

export async function updateRolePermissions(role: AppRole, keys: PermissionKey[]) {
  const { error: delErr } = await supabase.from("role_permissions").delete().eq("role", role);
  if (delErr) throw delErr;
  if (!keys.length) return;
  const { error } = await supabase.from("role_permissions").insert(
    keys.map((permission_key) => ({ role, permission_key })),
  );
  if (error) throw error;
}

export type CustomRole = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  based_on: AppRole | null;
  created_at: string;
};

export async function fetchCustomRoles(): Promise<CustomRole[]> {
  const { data, error } = await supabase.from("custom_roles").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as CustomRole[];
}

export async function createCustomRole(input: { name: string; description?: string; based_on?: AppRole }) {
  const { data, error } = await supabase
    .from("custom_roles")
    .insert({ name: input.name, description: input.description ?? null, based_on: input.based_on ?? null })
    .select()
    .single();
  if (error) throw error;
  return data as CustomRole;
}

export async function duplicateCustomRole(sourceId: string, newName: string) {
  const { data: source, error: se } = await supabase.from("custom_roles").select("*").eq("id", sourceId).single();
  if (se) throw se;
  const role = await createCustomRole({ name: newName, description: source.description, based_on: source.based_on });
  const { data: perms } = await supabase.from("custom_role_permissions").select("permission_key").eq("custom_role_id", sourceId);
  if (perms?.length) {
    await supabase.from("custom_role_permissions").insert(
      perms.map((p) => ({ custom_role_id: role.id, permission_key: p.permission_key })),
    );
  }
  return role;
}

export async function fetchCustomRolePermissions(roleId: string): Promise<PermissionKey[]> {
  const { data, error } = await supabase
    .from("custom_role_permissions")
    .select("permission_key")
    .eq("custom_role_id", roleId);
  if (error) throw error;
  return (data ?? []).map((r) => r.permission_key as PermissionKey);
}

export async function updateCustomRolePermissions(roleId: string, keys: PermissionKey[]) {
  const { error: delErr } = await supabase.from("custom_role_permissions").delete().eq("custom_role_id", roleId);
  if (delErr) throw delErr;
  if (!keys.length) return;
  const { error } = await supabase.from("custom_role_permissions").insert(
    keys.map((permission_key) => ({ custom_role_id: roleId, permission_key })),
  );
  if (error) throw error;
}

export async function deleteCustomRole(roleId: string) {
  const { error } = await supabase.from("custom_roles").delete().eq("id", roleId);
  if (error) throw error;
}

export function hasPermissionInSet(permissions: PermissionKey[], key: PermissionKey) {
  return permissions.includes(key);
}

export function hasAnyPermissionInSet(permissions: PermissionKey[], keys: PermissionKey[]) {
  return keys.some((k) => permissions.includes(k));
}
