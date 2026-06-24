import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, StatCard } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { fetchAllUsers, ROLE_LABEL } from "@/lib/users";
import type { AppRole } from "@/lib/auth";
import { Users, UtensilsCrossed, Shield, Sparkles, Wallet, UserCog } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/personnel")({
  component: AdminPersonnel,
});

const DEPT: Partial<Record<AppRole, { label: string; Icon: typeof Users; color: string }>> = {
  reception: { label: "Réception", Icon: Users, color: "border-blue-200 bg-blue-50" },
  restaurant_staff: { label: "Restaurant", Icon: UtensilsCrossed, color: "border-amber-200 bg-amber-50" },
  cleaning_staff: { label: "Entretien", Icon: Sparkles, color: "border-emerald-200 bg-emerald-50" },
  manager: { label: "Administration", Icon: Shield, color: "border-violet-200 bg-violet-50" },
  accountant: { label: "Comptabilité", Icon: Wallet, color: "border-slate-200 bg-slate-50" },
  super_admin: { label: "Direction", Icon: Shield, color: "border-gold/30 bg-gold-soft/20" },
};

function AdminPersonnel() {
  const { data: users = [], isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: fetchAllUsers });

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
        subtitle="Organigramme par service, effectifs et accès rapide à la gestion des comptes."
      >
        <Button variant="hero" size="sm" asChild>
          <Link to="/admin/utilisateurs"><UserCog className="mr-1 size-4" />Gérer les comptes</Link>
        </Button>
      </AdminPageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Effectif total" value={staff.length} Icon={Users} accent />
        <StatCard label="Services" value={Object.keys(byDept).length} Icon={Shield} />
        <StatCard label="Comptes staff" value={staff.length} Icon={UserCog} />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : staff.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <Users className="mx-auto size-12 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">Aucun membre du personnel. Attribuez des rôles dans Utilisateurs.</p>
          <Button className="mt-4" variant="hero" asChild><Link to="/admin/utilisateurs">Ajouter du personnel</Link></Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(byDept).map(([dept, members]) => {
            const meta = Object.values(DEPT).find((d) => d.label === dept);
            const Icon = meta?.Icon ?? Users;
            return (
              <div key={dept} className={`rounded-xl border p-6 shadow-sm ${meta?.color ?? "border-border bg-card"}`}>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                    <Icon className="size-5 text-gold-deep" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl">{dept}</h2>
                    <p className="text-sm text-muted-foreground">{members.length} membre(s)</p>
                  </div>
                </div>
                <ul className="mt-5 space-y-3">
                  {members.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/60 px-3 py-2.5 text-sm">
                      <div>
                        <p className="font-medium">{m.full_name || m.email}</p>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-semibold uppercase text-gold-deep">
                        {m.roles.filter((r) => r !== "customer").map((r) => ROLE_LABEL[r]).join(" · ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <strong className="text-foreground">À venir :</strong> planning des shifts, congés et export paie. En attendant, gérez les accès et rôles depuis{" "}
        <Link to="/admin/roles" className="text-gold-deep underline">Rôles & permissions</Link>.
      </div>
    </div>
  );
}
