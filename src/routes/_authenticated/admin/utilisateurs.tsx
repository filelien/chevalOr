import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import type { AppRole } from "@/lib/auth";
import { fetchAllUsers, assignRole, removeRole, ROLE_LABEL, STAFF_ASSIGNABLE } from "@/lib/users";
import { toast } from "sonner";
import { Shield, Search } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/utilisateurs")({
  component: AdminUsers,
});

function AdminUsers() {
  const { hasRole, user: currentUser } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string; roles: AppRole[] } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAllUsers,
    enabled: hasRole("super_admin"),
  });

  if (!hasRole("super_admin")) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6 text-center">
        <div>
          <Shield className="mx-auto size-12 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl">Accès super admin requis</h1>
          <p className="mt-2 text-muted-foreground">Seuls les super administrateurs peuvent gérer les rôles.</p>
        </div>
      </div>
    );
  }

  const filtered = (data ?? []).filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${u.full_name} ${u.email} ${u.phone}`.toLowerCase().includes(q);
  });

  async function toggleRole(userId: string, role: AppRole, hasIt: boolean) {
    try {
      if (hasIt) await removeRole(userId, role);
      else await assignRole(userId, role);
      toast.success(hasIt ? "Rôle retiré" : "Rôle attribué");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      if (editing) {
        const updated = editing.roles.filter((r) => r !== role);
        if (!hasIt) updated.push(role);
        setEditing({ ...editing, roles: updated });
      }
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="p-6 lg:p-10">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Module 3</span>
        <h1 className="mt-2 font-display text-4xl">Utilisateurs & rôles</h1>
        <p className="mt-1 text-sm text-muted-foreground">Attribuez les rôles staff aux comptes inscrits.</p>
      </div>

      <div className="relative mt-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email…"
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Rôles</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Chargement…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Aucun utilisateur.</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id} className="border-t border-border/60 align-top">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.full_name || "—"}</div>
                  {u.id === currentUser?.id && <span className="text-[10px] text-gold-deep">Vous</span>}
                </td>
                <td className="px-4 py-3">
                  <div>{u.email ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{u.phone}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map((r) => (
                      <span key={r} className={`rounded-full px-2 py-0.5 text-[10px] ${r === "customer" ? "bg-secondary text-muted-foreground" : "bg-onyx text-white"}`}>
                        {ROLE_LABEL[r]}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => setEditing({ id: u.id, name: u.full_name ?? u.email ?? "Utilisateur", roles: u.roles })}>
                    Gérer rôles
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Dialog open onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Rôles · {editing.name}</DialogTitle></DialogHeader>
            <div className="space-y-2">
              {STAFF_ASSIGNABLE.map((role) => {
                const hasIt = editing.roles.includes(role);
                return (
                  <label key={role} className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-3 py-2">
                    <span className="text-sm">{ROLE_LABEL[role]}</span>
                    <input
                      type="checkbox"
                      checked={hasIt}
                      onChange={() => toggleRole(editing.id, role, hasIt)}
                      disabled={editing.id === currentUser?.id && role === "super_admin" && hasIt}
                    />
                  </label>
                );
              })}
              <p className="text-xs text-muted-foreground">Le rôle « Client » est attribué automatiquement à l'inscription.</p>
            </div>
            <DialogFooter>
              <Button onClick={() => setEditing(null)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
