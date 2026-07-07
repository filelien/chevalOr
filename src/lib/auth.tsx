import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import type { PermissionKey } from "@/lib/permissions";
import { fetchUserPermissions } from "@/lib/rbac";
import { recordLogin } from "@/lib/audit";

export type AppRole =
  | "super_admin"
  | "manager"
  | "reception"
  | "restaurant_staff"
  | "accountant"
  | "cleaning_staff"
  | "customer";

export const STAFF_ROLES: AppRole[] = [
  "super_admin",
  "manager",
  "reception",
  "restaurant_staff",
  "accountant",
  "cleaning_staff",
];

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<PermissionKey[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRolesAndPermissions = useCallback(async (uid: string | undefined) => {
    if (!uid) {
      setRoles([]);
      setPermissions([]);
      return;
    }
    const [{ data: roleRows }, perms] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("user_roles").select("role").eq("user_id", uid).then(async ({ data }) => {
        const rs = (data ?? []).map((r) => r.role as AppRole);
        return fetchUserPermissions(uid, rs);
      }),
    ]);
    const roleList = (roleRows ?? []).map((r) => r.role as AppRole);
    setRoles(roleList);
    setPermissions(perms);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setTimeout(() => {
        loadRolesAndPermissions(s?.user?.id);
        if (event === "SIGNED_IN") recordLogin(true);
      }, 0);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      loadRolesAndPermissions(s?.user?.id).finally(() => setLoading(false));
    });
    return () => sub.subscription.unsubscribe();
  }, [loadRolesAndPermissions]);

  const hasRole = (r: AppRole) => roles.includes(r);
  const hasAnyRole = (rs: AppRole[]) => rs.some((r) => roles.includes(r));
  const isStaff = hasAnyRole(STAFF_ROLES);
  const hasPermission = (p: PermissionKey) => permissions.includes(p) || hasRole("super_admin");
  const hasAnyPermission = (ps: PermissionKey[]) => ps.some((p) => hasPermission(p));

  return {
    session, user, roles, permissions, loading,
    hasRole, hasAnyRole, isStaff, hasPermission, hasAnyPermission,
    refreshPermissions: () => loadRolesAndPermissions(user?.id),
  };
}

export async function signOut() {
  await supabase.auth.signOut();
}
