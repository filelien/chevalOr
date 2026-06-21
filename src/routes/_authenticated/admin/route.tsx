import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { STAFF_ROLES, type AppRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminGate,
});

function AdminGate() {
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setState("denied"); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const roles = (data ?? []).map((r) => r.role as AppRole);
      setState(roles.some((r) => STAFF_ROLES.includes(r)) ? "ok" : "denied");
    })();
  }, []);

  if (state === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Chargement…</div>;
  }
  if (state === "denied") {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-3xl">Accès réservé</h1>
        <p className="mt-3 text-muted-foreground">
          Votre compte n'a pas encore de rôle administrateur. Contactez un super administrateur
          pour qu'il vous attribue un rôle (manager, réception, etc.).
        </p>
        <Button variant="hero" className="mt-6" asChild><Link to="/">Retour à l'accueil</Link></Button>
      </div>
    );
  }
  return <AdminShell />;
}