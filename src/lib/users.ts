import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export type AccountStatus = "active" | "suspended" | "inactive";

export type UserWithRoles = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  department: string | null;
  job_title: string | null;
  account_status: AccountStatus;
  hired_at: string | null;
  last_login_at: string | null;
  mfa_required: boolean;
  created_at: string;
  roles: AppRole[];
  custom_roles: { id: string; name: string }[];
};

export const ROLE_LABEL: Record<AppRole, string> = {
  super_admin: "Super Admin",
  manager: "Directeur / Manager",
  reception: "Réceptionniste",
  restaurant_staff: "Restaurant",
  accountant: "Comptable",
  cleaning_staff: "Ménage",
  customer: "Client",
};

export const DEPARTMENTS = ["Direction", "Réception", "Restaurant", "Comptabilité", "Ménage", "Maintenance", "Marketing"] as const;

export const STAFF_ASSIGNABLE: AppRole[] = [
  "super_admin",
  "manager",
  "reception",
  "restaurant_staff",
  "accountant",
  "cleaning_staff",
];

export const STATUS_LABEL: Record<AccountStatus, string> = {
  active: "Actif",
  suspended: "Suspendu",
  inactive: "Inactif",
};

export async function fetchAllUsers(): Promise<UserWithRoles[]> {
  const [
    { data: profiles, error: pe },
    { data: roles, error: re },
    { data: customLinks, error: ce },
    { data: customRoles, error: cre },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, phone, avatar_url, department, job_title, account_status, hired_at, last_login_at, mfa_required, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id, role"),
    supabase.from("user_custom_roles").select("user_id, custom_role_id"),
    supabase.from("custom_roles").select("id, name"),
  ]);
  if (pe) throw pe;
  if (re) throw re;
  if (ce) throw ce;
  if (cre) throw cre;

  const roleMap = new Map<string, AppRole[]>();
  for (const r of roles ?? []) {
    const list = roleMap.get(r.user_id) ?? [];
    list.push(r.role as AppRole);
    roleMap.set(r.user_id, list);
  }

  const customRoleMap = new Map((customRoles ?? []).map((cr) => [cr.id, cr.name]));
  const userCustomMap = new Map<string, { id: string; name: string }[]>();
  for (const link of customLinks ?? []) {
    const list = userCustomMap.get(link.user_id) ?? [];
    const name = customRoleMap.get(link.custom_role_id);
    if (name) list.push({ id: link.custom_role_id, name });
    userCustomMap.set(link.user_id, list);
  }

  return (profiles ?? []).map((p) => ({
    ...p,
    account_status: (p.account_status ?? "active") as AccountStatus,
    mfa_required: p.mfa_required ?? false,
    roles: roleMap.get(p.id) ?? ["customer"],
    custom_roles: userCustomMap.get(p.id) ?? [],
  }));
}

export async function updateUserProfile(
  userId: string,
  patch: Partial<Pick<UserWithRoles, "full_name" | "phone" | "department" | "job_title" | "hired_at" | "mfa_required" | "account_status">>,
) {
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
  await logAudit({
    action: "profile_updated",
    module: "user",
    entity_type: "profile",
    entity_id: userId,
    details: patch as Record<string, unknown>,
  });
}

export async function assignRole(userId: string, role: AppRole) {
  const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
  if (error) throw error;
}

export async function removeRole(userId: string, role: AppRole) {
  const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
  if (error) throw error;
}

export async function assignCustomRole(userId: string, customRoleId: string) {
  const { error } = await supabase.from("user_custom_roles").insert({ user_id: userId, custom_role_id: customRoleId });
  if (error) throw error;
}

export async function removeCustomRole(userId: string, customRoleId: string) {
  const { error } = await supabase.from("user_custom_roles").delete().eq("user_id", userId).eq("custom_role_id", customRoleId);
  if (error) throw error;
}

export function getUserStats(users: UserWithRoles[]) {
  const staff = users.filter((u) => u.roles.some((r) => r !== "customer"));
  return {
    total: users.length,
    staff: staff.length,
    active: staff.filter((u) => u.account_status === "active").length,
    suspended: staff.filter((u) => u.account_status === "suspended").length,
    recentLogins: staff.filter((u) => u.last_login_at && Date.now() - new Date(u.last_login_at).getTime() < 7 * 86400000).length,
  };
}
