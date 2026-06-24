import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Users, Trash2 } from "lucide-react";
import { ROLE_LABEL } from "@/lib/users";
import type { AppRole } from "@/lib/auth";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin/groupes")({
  component: AdminGroupes,
});

type StaffGroup = {
  id: string;
  name: string;
  description: string;
  roles: AppRole[];
  member_count: number;
};

function AdminGroupes() {
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const { data: groups = [] } = useQuery({
    queryKey: ["staff-groups"],
    queryFn: async () => {
      const stored = await supabase.from("site_settings").select("value").eq("key", "staff_groups").maybeSingle();
      if (stored.data?.value) return stored.data.value as StaffGroup[];
      return [
        { id: "reception", name: "Réception", description: "Accueil & réservations", roles: ["reception", "manager"] as AppRole[], member_count: 0 },
        { id: "restaurant", name: "Restaurant", description: "Service & cuisine", roles: ["restaurant_staff"] as AppRole[], member_count: 0 },
        { id: "finance", name: "Finance", description: "Comptabilité & paiements", roles: ["accountant", "manager"] as AppRole[], member_count: 0 },
      ];
    },
  });

  const { data: users } = useQuery({
    queryKey: ["group-users-count"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role");
      return data ?? [];
    },
  });

  async function saveGroup() {
    if (!name.trim()) return;
    const newGroup: StaffGroup = {
      id: `g-${Date.now()}`,
      name: name.trim(),
      description: desc,
      roles: ["reception"],
      member_count: 0,
    };
    const next = [...groups, newGroup];
    await supabase.from("site_settings").upsert({ key: "staff_groups", value: next, updated_at: new Date().toISOString() });
    toast.success("Groupe créé");
    setShowForm(false);
    setName("");
    qc.invalidateQueries({ queryKey: ["staff-groups"] });
  }

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminPageHeader label="Administration" title="Groupes" subtitle="Organisez les équipes par département et rôles associés.">
        {hasPermission("user.edit") && (
          <Button variant="hero" size="sm" onClick={() => setShowForm(true)}><Plus className="mr-1 size-4" />Nouveau groupe</Button>
        )}
      </AdminPageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div key={g.id} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <Users className="size-8 text-gold-deep" />
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                {(users ?? []).filter((u: any) => g.roles.includes(u.role)).length} membres
              </span>
            </div>
            <h3 className="mt-3 font-display text-xl">{g.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {g.roles.map((r) => (
                <span key={r} className="rounded bg-gold-soft/40 px-2 py-0.5 text-[10px] font-medium text-gold-deep">
                  {ROLE_LABEL[r] ?? r}
                </span>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link to="/admin/utilisateurs">Gérer les membres</Link>
            </Button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 space-y-3">
            <h2 className="font-display text-xl">Nouveau groupe</h2>
            <input className="w-full rounded-md border px-3 py-2" placeholder="Nom du groupe" value={name} onChange={(e) => setName(e.target.value)} />
            <textarea className="w-full rounded-md border px-3 py-2" placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button variant="hero" onClick={saveGroup}>Créer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
