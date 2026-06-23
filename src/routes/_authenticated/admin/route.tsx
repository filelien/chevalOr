import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { STAFF_ROLES, type AppRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { ADMIN_ROUTE_ROLES } from "@/lib/admin-access";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminGate,
});

function AdminGate() {
  const [state, setState] = useState<"loading" | "ok" | "denied" | "forbidden">("loading");
  const [roles, setRoles] = useState<AppRole[]>([]);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setState("denied"); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const userRoles = (data ?? []).map((r) => r.role as AppRole);
      setRoles(userRoles);
      if (!userRoles.some((r) => STAFF_ROLES.includes(r))) { setState("denied"); return; }
      setState("ok");
    })();
  }, []);

  useEffect(() => {
    if (!roles.length) return;
    const segment = pathname.replace(/^\/admin\/?/, "").split("/")[0] || "";
    const required = ADMIN_ROUTE_ROLES[segment];
    if (!required || roles.some((r) => required.includes(r))) {
      setState("ok");
    } else {
      setState("forbidden");
    }
  }, [pathname, roles]);

  if (state === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Chargement…</div>;
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
          <p className="mt-2 text-muted-foreground">Votre rôle ne permet pas d'accéder à cette section.</p>
          <Button variant="hero" className="mt-6" asChild><Link to="/admin">Tableau de bord</Link></Button>
        </div>
      </AdminShell>
    );
  }
  return <AdminShell />;
}
