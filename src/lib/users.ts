import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/auth";

export type UserWithRoles = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  roles: AppRole[];
};

export const ROLE_LABEL: Record<AppRole, string> = {
  super_admin: "Super Admin",
  manager: "Manager",
  reception: "Réception",
  restaurant_staff: "Restaurant",
  accountant: "Comptable",
  cleaning_staff: "Ménage",
  customer: "Client",
};

export const STAFF_ASSIGNABLE: AppRole[] = [
  "super_admin",
  "manager",
  "reception",
  "restaurant_staff",
  "accountant",
  "cleaning_staff",
];

export async function fetchAllUsers(): Promise<UserWithRoles[]> {
  const [{ data: profiles, error: pe }, { data: roles, error: re }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, phone, created_at").order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id, role"),
  ]);
  if (pe) throw pe;
  if (re) throw re;

  const roleMap = new Map<string, AppRole[]>();
  for (const r of roles ?? []) {
    const list = roleMap.get(r.user_id) ?? [];
    list.push(r.role as AppRole);
    roleMap.set(r.user_id, list);
  }

  return (profiles ?? []).map((p) => ({
    ...p,
    roles: roleMap.get(p.id) ?? ["customer"],
  }));
}

export async function assignRole(userId: string, role: AppRole) {
  const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
  if (error) throw error;
}

export async function removeRole(userId: string, role: AppRole) {
  const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
  if (error) throw error;
}
