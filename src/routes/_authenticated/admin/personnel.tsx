import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { fetchAllUsers, ROLE_LABEL } from "@/lib/users";
import type { AppRole } from "@/lib/auth";
import { Users, UtensilsCrossed, Shield, Sparkles, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/personnel")({
  component: AdminPersonnel,
});

const DEPT: Partial<Record<AppRole, { label: string; Icon: typeof Users }>> = {
  reception: { label: "Réception", Icon: Users },
  restaurant_staff: { label: "Restaurant", Icon: UtensilsCrossed },
  cleaning_staff: { label: "Entretien", Icon: Sparkles },
  manager: { label: "Administration", Icon: Shield },
  accountant: { label: "Comptabilité", Icon: Wallet },
  super_admin: { label: "Direction", Icon: Shield },
};

function AdminPersonnel() {
  const { data: users = [] } = useQuery({ queryKey: ["admin-users"], queryFn: fetchAllUsers });

  const staff = users.filter((u) => u.roles.some((r) => r !== "customer"));

  const byDept = staff.reduce<Record<string, typeof staff>>((acc, u) => {
    const main = u.roles.find((r) => r !== "customer") ?? "reception";
    const key = DEPT[main]?.label ?? "Autre";
    (acc[key] ??= []).push(u);
    return acc;
  }, {});

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Ressources humaines"
        title="Gestion du personnel"
        subtitle="Vue par service : réception, restaurant, entretien, administration. Horaires et congés : module à venir."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(byDept).map(([dept, members]) => (
          <div key={dept} className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-xl">{dept}</h2>
            <p className="text-sm text-muted-foreground">{members.length} membre(s)</p>
            <ul className="mt-4 space-y-3">
              {members.map((m) => (
                <li key={m.id} className="flex justify-between gap-2 text-sm border-b border-border/40 pb-2">
                  <span>{m.full_name || m.email}</span>
                  <span className="text-xs text-gold-deep">{m.roles.map((r) => ROLE_LABEL[r]).join(", ")}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {staff.length === 0 && (
        <p className="text-muted-foreground">Aucun membre du personnel. Attribuez des rôles dans Sécurité & rôles.</p>
      )}

      <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        Présence, horaires, salaires et congés — connectez un module RH ou exportez vers votre logiciel de paie.
      </div>
    </div>
  );
}
