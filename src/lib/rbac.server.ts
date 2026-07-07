import { createServerFn } from "@tanstack/react-start";
import type { PermissionKey } from "@/lib/permissions";
import type { AppRole } from "@/lib/auth";

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

export const adminCreateUser = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: AdminActionInput & {
    email: string;
    full_name?: string;
    phone?: string;
    department?: string;
    job_title?: string;
    roles?: AppRole[];
    mfa_required?: boolean;
    account_status?: "active" | "suspended" | "inactive";
  } }) => {
    assertPermission(data, "user.edit");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email?.trim().toLowerCase();
    if (!email) return { ok: false as const, error: "Email requis" };

    const tempPassword = `${crypto.randomUUID().slice(0, 8)}!A1`;
    const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name,
        phone: data.phone,
        department: data.department,
        job_title: data.job_title,
      },
    });

    if (createError || !createdUser) {
      return { ok: false as const, error: createError?.message ?? "Impossible de créer l'utilisateur" };
    }

    const userId = (createdUser as any)?.id ?? (createdUser.user as any)?.id;
    if (!userId) {
      return { ok: false as const, error: "Impossible de récupérer l'identifiant utilisateur" };
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      full_name: data.full_name ?? null,
      email,
      phone: data.phone ?? null,
      department: data.department ?? null,
      job_title: data.job_title ?? null,
      account_status: data.account_status ?? "active",
      mfa_required: data.mfa_required ?? false,
    });
    if (profileError) return { ok: false as const, error: profileError.message };

    const roles = data.roles && data.roles.length > 0 ? data.roles : ["customer"];
    for (const role of roles) {
      const { error: roleError } = await supabaseAdmin.from("user_roles").insert({ user_id: userId, role });
      if (roleError) return { ok: false as const, error: roleError.message };
    }

    const siteUrl = process.env.VITE_SITE_URL ?? process.env.SITE_URL ?? "https://cheval-or.vercel.app";
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth`,
    });
    if (resetError) return { ok: false as const, error: resetError.message };

    return { ok: true as const, userId };
  });
