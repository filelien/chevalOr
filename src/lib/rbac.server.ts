import { createServerFn } from "@tanstack/react-start";
import type { PermissionKey } from "@/lib/permissions";

type AdminActionInput = {
  callerUserId: string;
  callerPermissions: PermissionKey[];
};

function assertPermission(input: AdminActionInput, permission: PermissionKey) {
  if (input.callerPermissions.includes(permission)) return;
  throw new Error("Permission insuffisante");
}

/** Réinitialisation mot de passe (envoi email recovery) — nécessite SUPABASE_SERVICE_ROLE_KEY. */
export const adminResetPassword = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: AdminActionInput & { email: string } }) => {
    assertPermission(data, "user.edit");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const siteUrl = process.env.VITE_SITE_URL ?? process.env.SITE_URL ?? "https://cheval-or.vercel.app";
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${siteUrl}/auth`,
    });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

/** Suspendre / réactiver un compte staff via profil. */
export const adminSetAccountStatus = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: AdminActionInput & { userId: string; status: "active" | "suspended" | "inactive" } }) => {
    assertPermission(data, "user.edit");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ account_status: data.status })
      .eq("id", data.userId);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
