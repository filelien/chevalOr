import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth, type AppRole } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PermissionMatrix } from "@/components/admin/PermissionMatrix";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, Copy, Plus, Trash2, Save } from "lucide-react";
import { type PermissionKey } from "@/lib/permissions";
import {
  fetchRolePermissions, updateRolePermissions,
  fetchCustomRoles, createCustomRole, duplicateCustomRole,
  fetchCustomRolePermissions, updateCustomRolePermissions, deleteCustomRole,
} from "@/lib/rbac";
import { ROLE_LABEL, STAFF_ASSIGNABLE } from "@/lib/users";
import { ROLE_BADGES } from "@/lib/permission-matrix";
import { logAudit } from "@/lib/audit";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/roles")({
  component: RolesPage,
});

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
  const roleTitle = selectedRole === "custom"
    ? customRoles.find((r) => r.id === selectedCustomId)?.name ?? "Rôle personnalisé"
    : ROLE_LABEL[selectedRole as AppRole];

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
  const isLocked = selectedRole === "super_admin";

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminPageHeader
        label="Administration · Sécurité"
        title="Rôles & permissions"
        subtitle="Matrice granulaire par module — VOIR, AJOUTER, MODIFIER, SUPPRIMER, EXPORTER, VALIDER."
      >
        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setNewRoleOpen(true)}>
              <Plus className="mr-1 size-4" />Rôle personnalisé
            </Button>
            {dirty && (
              <Button size="sm" variant="hero" onClick={savePermissions}>
                <Save className="mr-1 size-4" />Enregistrer le rôle
              </Button>
            )}
          </div>
        )}
      </AdminPageHeader>

      <div className="flex flex-col gap-6 xl:flex-row">
        <aside className="w-full shrink-0 xl:w-64">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Système</p>
            <div className="space-y-1">
              {STAFF_ASSIGNABLE.map((role) => (
                <button
                  key={role}
                  onClick={() => { setSelectedRole(role); setSelectedCustomId(null); }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    selectedRole === role ? "bg-onyx text-white shadow-md" : "hover:bg-secondary"
                  }`}
                >
                  <span>{ROLE_LABEL[role]}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    selectedRole === role ? "bg-gold-deep/30 text-gold-soft" : "bg-secondary text-muted-foreground"
                  }`}>
                    {ROLE_BADGES[role] ?? role.slice(0, 3).toUpperCase()}
                  </span>
                </button>
              ))}
            </div>

            {customRoles.length > 0 && (
              <>
                <p className="mb-3 mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Personnalisés</p>
                <div className="space-y-1">
                  {customRoles.map((cr) => (
                    <div key={cr.id} className="flex items-center gap-1">
                      <button
                        onClick={() => { setSelectedRole("custom"); setSelectedCustomId(cr.id); }}
                        className={`flex-1 rounded-lg px-3 py-2 text-left text-sm transition ${
                          selectedCustomId === cr.id ? "bg-gold-deep/15 font-medium text-gold-deep ring-1 ring-gold-deep/30" : "hover:bg-secondary"
                        }`}
                      >
                        {cr.name}
                      </button>
                      {canEdit && (
                        <>
                          <button onClick={() => handleDuplicate(cr.id, cr.name)} className="rounded p-1.5 hover:bg-secondary" title="Dupliquer">
                            <Copy className="size-3.5" />
                          </button>
                          <button onClick={() => handleDelete(cr.id)} className="rounded p-1.5 hover:bg-red-50 text-red-600" title="Supprimer">
                            <Trash2 className="size-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
            <div>
              <h2 className="font-display text-2xl">{roleTitle}</h2>
              <p className="text-sm text-muted-foreground">
                {draft.size} permission{draft.size !== 1 ? "s" : ""} active{draft.size !== 1 ? "s" : ""}
                {isLocked && " · Super admin : accès total (lecture seule)"}
              </p>
            </div>
            {dirty && canEdit && !isLocked && (
              <Button variant="hero" size="sm" onClick={savePermissions}>
                <Save className="mr-1 size-4" />Enregistrer
              </Button>
            )}
          </div>

          <PermissionMatrix
            draft={draft}
            canEdit={canEdit && !isLocked}
            locked={isLocked}
            onToggle={togglePerm}
          />
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
            <Button variant="hero" onClick={handleCreateRole}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
