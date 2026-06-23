import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { STAFF_ROLES, type AppRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { canAccessRoute } from "@/lib/admin-access";
import { fetchUserPermissions } from "@/lib/rbac";
import type { PermissionKey } from "@/lib/permissions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminGate,
});

function AdminGate() {
  const [state, setState] = useState<"loading" | "ok" | "denied" | "forbidden" | "suspended">("loading");
  const [permissions, setPermissions] = useState<PermissionKey[]>([]);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setState("denied"); return; }

      const [{ data: roleRows }, { data: profile }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("profiles").select("account_status").eq("id", user.id).single(),
      ]);

      const userRoles = (roleRows ?? []).map((r) => r.role as AppRole);
      if (!userRoles.some((r) => STAFF_ROLES.includes(r))) { setState("denied"); return; }
      if (profile?.account_status === "suspended") { setState("suspended"); return; }

      const perms = await fetchUserPermissions(user.id, userRoles);
      setPermissions(perms);
      setState("ok");
    })();
  }, []);

  useEffect(() => {
    if (!permissions.length && state !== "ok") return;
    const segment = pathname.replace(/^\/admin\/?/, "").split("/")[0] || "";
    if (canAccessRoute(permissions, segment)) {
      setState((s) => (s === "suspended" || s === "denied" ? s : "ok"));
    } else {
      setState("forbidden");
    }
  }, [pathname, permissions, state]);

  if (state === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Chargement…</div>;
  }
  if (state === "suspended") {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-3xl">Compte suspendu</h1>
        <p className="mt-3 text-muted-foreground">Contactez un administrateur pour réactiver votre accès.</p>
        <Button variant="hero" className="mt-6" asChild><Link to="/">Retour à l'accueil</Link></Button>
      </div>
    );
  }
  if (state === "denied") {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-3xl">Accès réservé</h1>
        <p className="mt-3 text-muted-foreground">
          Votre compte n'a pas encore de rôle administrateur. Contactez un super administrateur.
        </p>
        <Button variant="hero" className="mt-6" asChild><Link to="/">Retour à l'accueil</Link></Button>
      </div>
    );
  }
  if (state === "forbidden") {
    return (
      <AdminShell>
        <div className="p-12 text-center">
          <h2 className="font-display text-2xl">Accès non autorisé</h2>
          <p className="mt-2 text-muted-foreground">Vous n'avez pas la permission requise pour cette section.</p>
          <Button variant="hero" className="mt-6" asChild><Link to="/admin">Tableau de bord</Link></Button>
        </div>
      </AdminShell>
    );
  }
  return <AdminShell />;
}
