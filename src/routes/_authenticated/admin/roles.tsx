import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useAuth, type AppRole } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, Copy, Plus, Trash2, Save } from "lucide-react";
import {
  PERMISSION_LABELS, MODULE_LABELS, type PermissionKey,
} from "@/lib/permissions";
import {
  fetchRolePermissions, updateRolePermissions,
  fetchCustomRoles, createCustomRole, duplicateCustomRole,
  fetchCustomRolePermissions, updateCustomRolePermissions, deleteCustomRole,
} from "@/lib/rbac";
import { ROLE_LABEL, STAFF_ASSIGNABLE } from "@/lib/users";
import { logAudit } from "@/lib/audit";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/roles")({
  component: RolesPage,
});

const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS) as PermissionKey[];

const MATRIX_MODULES = [
  "reservation", "room", "client", "finance", "conference", "event",
  "restaurant", "stock", "staff", "payment", "report", "marketing",
  "review", "message", "site", "gallery", "seo", "user", "role", "settings", "audit",
] as const;

function RolesPage() {
  const { hasPermission } = useAuth();
  const qc = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<AppRole | "custom">("manager");
  const [selectedCustomId, setSelectedCustomId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Set<PermissionKey>>(new Set());
  const [dirty, setDirty] = useState(false);
  const [newRoleOpen, setNewRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const { data: customRoles = [] } = useQuery({
    queryKey: ["custom-roles"],
    queryFn: fetchCustomRoles,
    enabled: hasPermission("role.view"),
  });

  const activeKey = selectedRole === "custom" ? selectedCustomId : selectedRole;

  useQuery({
    queryKey: ["role-perms", activeKey],
    queryFn: async () => {
      if (!activeKey) return [];
      const perms = selectedRole === "custom"
        ? await fetchCustomRolePermissions(activeKey)
        : await fetchRolePermissions(activeKey as AppRole);
      setDraft(new Set(perms));
      setDirty(false);
      return perms;
    },
    enabled: !!activeKey && hasPermission("role.view"),
  });

  const grouped = useMemo(() => {
    const map = new Map<string, PermissionKey[]>();
    for (const key of ALL_PERMISSIONS) {
      const mod = key.split(".")[0];
      if (!MATRIX_MODULES.includes(mod as typeof MATRIX_MODULES[number])) continue;
      const list = map.get(mod) ?? [];
      list.push(key);
      map.set(mod, list);
    }
    return map;
  }, []);

  if (!hasPermission("role.view")) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6 text-center">
        <Shield className="mx-auto size-12 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl">Accès refusé</h1>
      </div>
    );
  }

  function togglePerm(key: PermissionKey) {
    if (!hasPermission("role.manage")) return;
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setDirty(true);
  }

  async function savePermissions() {
    if (!activeKey) return;
    try {
      const keys = [...draft];
      if (selectedRole === "custom") {
        await updateCustomRolePermissions(activeKey, keys);
      } else {
        await updateRolePermissions(activeKey as AppRole, keys);
      }
      await logAudit({ action: "permissions_updated", module: "role", entity_id: activeKey, details: { count: keys.length } });
      toast.success("Permissions enregistrées");
      setDirty(false);
      qc.invalidateQueries({ queryKey: ["role-perms", activeKey] });
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  }

  async function handleCreateRole() {
    if (!newRoleName.trim()) return;
    try {
      await createCustomRole({ name: newRoleName.trim(), based_on: "reception" });
      toast.success("Rôle créé");
      setNewRoleOpen(false);
      setNewRoleName("");
      qc.invalidateQueries({ queryKey: ["custom-roles"] });
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  }

  async function handleDuplicate(id: string, name: string) {
    try {
      await duplicateCustomRole(id, `${name} (copie)`);
      toast.success("Rôle dupliqué");
      qc.invalidateQueries({ queryKey: ["custom-roles"] });
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce rôle personnalisé ?")) return;
    try {
      await deleteCustomRole(id);
      toast.success("Rôle supprimé");
      if (selectedCustomId === id) setSelectedCustomId(null);
      qc.invalidateQueries({ queryKey: ["custom-roles"] });
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  }

  const canEdit = hasPermission("role.manage");

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="RBAC"
        title="Gestion des rôles & permissions"
        subtitle="Matrice granulaire par module — frontend, API et RLS Supabase."
      >
        {canEdit && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setNewRoleOpen(true)}>
              <Plus className="mr-1 size-4" />Nouveau rôle
            </Button>
            {dirty && (
              <Button size="sm" onClick={savePermissions}><Save className="mr-1 size-4" />Enregistrer</Button>
            )}
          </div>
        )}
      </AdminPageHeader>

      <div className="flex flex-wrap gap-6">
        <aside className="w-full shrink-0 space-y-4 lg:w-56">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Rôles système</p>
            {STAFF_ASSIGNABLE.map((role) => (
              <button
                key={role}
                onClick={() => { setSelectedRole(role); setSelectedCustomId(null); }}
                className={`mb-1 block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  selectedRole === role ? "bg-gold-deep/20 font-medium text-gold-deep" : "hover:bg-secondary"
                }`}
              >
                {ROLE_LABEL[role]}
              </button>
            ))}
          </div>
          {customRoles.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Rôles personnalisés</p>
              {customRoles.map((cr) => (
                <div key={cr.id} className="mb-1 flex items-center gap-1">
                  <button
                    onClick={() => { setSelectedRole("custom"); setSelectedCustomId(cr.id); }}
                    className={`flex-1 rounded-lg px-3 py-2 text-left text-sm transition ${
                      selectedCustomId === cr.id ? "bg-gold-deep/20 font-medium text-gold-deep" : "hover:bg-secondary"
                    }`}
                  >
                    {cr.name}
                  </button>
                  {canEdit && (
                    <>
                      <button onClick={() => handleDuplicate(cr.id, cr.name)} className="rounded p-1 hover:bg-secondary" title="Dupliquer">
                        <Copy className="size-3.5" />
                      </button>
                      <button onClick={() => handleDelete(cr.id)} className="rounded p-1 hover:bg-red-50 text-red-600" title="Supprimer">
                        <Trash2 className="size-3.5" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </aside>

        <div className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 min-w-[140px]">Module</th>
                <th className="p-3">Permissions</th>
              </tr>
            </thead>
            <tbody>
              {[...grouped.entries()].map(([mod, perms]) => (
                <tr key={mod} className="border-b border-border/50">
                  <td className="p-3 font-medium align-top">{MODULE_LABELS[mod] ?? mod}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {perms.map((key) => {
                        const on = draft.has(key);
                        const action = key.split(".")[1];
                        return (
                          <button
                            key={key}
                            disabled={!canEdit || selectedRole === "super_admin"}
                            onClick={() => togglePerm(key)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                              on ? "bg-emerald-600 text-white" : "bg-secondary text-muted-foreground"
                            } ${!canEdit ? "cursor-default" : "hover:opacity-80"}`}
                            title={PERMISSION_LABELS[key]}
                          >
                            {action}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedRole === "super_admin" && (
            <p className="p-4 text-xs text-muted-foreground">Le super administrateur possède toutes les permissions par défaut.</p>
          )}
        </div>
      </div>

      <Dialog open={newRoleOpen} onOpenChange={setNewRoleOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouveau rôle personnalisé</DialogTitle></DialogHeader>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Ex. Chef de réception"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRoleOpen(false)}>Annuler</Button>
            <Button onClick={handleCreateRole}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
