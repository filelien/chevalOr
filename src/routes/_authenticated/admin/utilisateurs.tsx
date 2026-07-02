import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import type { AppRole } from "@/lib/auth";
import {
  fetchAllUsers, assignRole, removeRole, updateUserProfile,
  ROLE_LABEL, STAFF_ASSIGNABLE, DEPARTMENTS, STATUS_LABEL,
  getUserStats, type UserWithRoles, type AccountStatus,
  assignCustomRole, removeCustomRole,
} from "@/lib/users";
import { fetchCustomRoles } from "@/lib/rbac";
import { adminCreateUser, adminResetPassword, adminSetAccountStatus } from "@/lib/rbac.server";
import { downloadCsv } from "@/lib/export";
import { fetchLoginHistory } from "@/lib/audit";
import { AdminPageHeader, StatCard } from "@/components/admin/AdminPageHeader";
import { toast } from "sonner";
import {
  Shield, Search, Download, Users, UserCheck, UserX, Clock,
  MoreHorizontal, KeyRound, Ban, CheckCircle, Pencil,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated/admin/utilisateurs")({
  component: AdminUsers,
});

function AdminUsers() {
  const { hasPermission, user: currentUser, permissions, user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<AccountStatus | "">("");
  const [editing, setEditing] = useState<UserWithRoles | null>(null);
  const [historyUser, setHistoryUser] = useState<UserWithRoles | null>(null);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    full_name: "",
    phone: "",
    department: "",
    job_title: "",
    roles: ["reception"] as AppRole[],
    account_status: "active" as AccountStatus,
    mfa_required: false,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAllUsers,
    enabled: hasPermission("user.view"),
  });

  const { data: customRoles = [] } = useQuery({
    queryKey: ["custom-roles"],
    queryFn: fetchCustomRoles,
    enabled: hasPermission("user.view"),
  });

  const { data: loginHistory = [] } = useQuery({
    queryKey: ["login-history", historyUser?.id],
    queryFn: () => fetchLoginHistory(historyUser!.id, 20),
    enabled: !!historyUser,
  });

  const stats = useMemo(() => getUserStats(data ?? []), [data]);

  const filtered = useMemo(() => {
    return (data ?? []).filter((u) => {
      if (deptFilter && u.department !== deptFilter) return false;
      if (statusFilter && u.account_status !== statusFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return `${u.full_name} ${u.email} ${u.phone} ${u.job_title} ${u.department}`.toLowerCase().includes(q);
    });
  }, [data, search, deptFilter, statusFilter]);

  if (!hasPermission("user.view")) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6 text-center">
        <div>
          <Shield className="mx-auto size-12 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl">Accès refusé</h1>
          <p className="mt-2 text-muted-foreground">Permission « user.view » requise.</p>
        </div>
      </div>
    );
  }

  async function toggleRole(userId: string, role: AppRole, hasIt: boolean) {
    try {
      if (hasIt) await removeRole(userId, role);
      else await assignRole(userId, role);
      toast.success(hasIt ? "Rôle retiré" : "Rôle attribué");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setEditing((prev) => {
        if (!prev || prev.id !== userId) return prev;
        const roles = hasIt
          ? prev.roles.filter((r) => r !== role)
          : [...prev.roles, role];
        return { ...prev, roles };
      });
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  }

  async function saveProfile() {
    if (!editing) return;
    try {
      await updateUserProfile(editing.id, {
        full_name: editing.full_name,
        phone: editing.phone,
        department: editing.department,
        job_title: editing.job_title,
        hired_at: editing.hired_at,
        mfa_required: editing.mfa_required,
      });
      toast.success("Profil mis à jour");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setEditing(null);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  }

  async function handleResetPassword(email: string | null) {
    if (!email || !user) return;
    try {
      const res = await adminResetPassword({
        data: { callerUserId: user.id, callerPermissions: permissions, email },
      });
      if (res.ok) toast.success("Email de réinitialisation envoyé");
      else toast.error(res.error ?? "Échec — vérifiez SUPABASE_SERVICE_ROLE_KEY");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  }

  async function handleStatusChange(userId: string, status: AccountStatus) {
    if (!user) return;
    try {
      const res = await adminSetAccountStatus({
        data: { callerUserId: user.id, callerPermissions: permissions, userId, status },
      });
      if (res.ok) {
        toast.success(status === "active" ? "Compte réactivé" : "Compte suspendu");
        qc.invalidateQueries({ queryKey: ["admin-users"] });
      } else toast.error(res.error ?? "Erreur");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Erreur"); }
  }

  async function createUser() {
    if (!user) return;
    try {
      const res = await adminCreateUser({
        data: {
          callerUserId: user.id,
          callerPermissions: permissions,
          email: newUser.email,
          full_name: newUser.full_name,
          phone: newUser.phone,
          department: newUser.department || undefined,
          job_title: newUser.job_title || undefined,
          roles: newUser.roles,
          mfa_required: newUser.mfa_required,
          account_status: newUser.account_status,
        },
      });
      if (!res.ok) throw new Error(res.error ?? "Échec création utilisateur");
      toast.success("Utilisateur créé. Un email d&#39;invitation a été envoyé.");
      setCreating(false);
      setNewUser({
        email: "",
        full_name: "",
        phone: "",
        department: "",
        job_title: "",
        roles: ["reception"],
        account_status: "active",
        mfa_required: false,
      });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  function exportUsers() {
    downloadCsv(
      "utilisateurs-cheval-dor.csv",
      ["Nom", "Email", "Téléphone", "Département", "Poste", "Rôles", "Statut", "Dernière connexion"],
      filtered.map((u) => [
        u.full_name, u.email, u.phone, u.department, u.job_title,
        u.roles.map((r) => ROLE_LABEL[r]).join("; "),
        STATUS_LABEL[u.account_status],
        u.last_login_at ? new Date(u.last_login_at).toLocaleString("fr-FR") : "",
      ]),
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Administration"
        title="Utilisateurs & accès"
        subtitle="Gestion des comptes staff, rôles RBAC, statuts et historique de connexion."
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportUsers}><Download className="mr-1 size-4" />Export CSV</Button>
          {hasPermission("user.edit") && (
            <Button variant="outline" size="sm" onClick={() => setCreating(true)}>Nouvel utilisateur</Button>
          )}
          {hasPermission("role.view") && (
            <Button variant="hero" size="sm" asChild><Link to="/admin/roles">Matrice des rôles</Link></Button>
          )}
        </div>
      </AdminPageHeader>

      {creating && (
        <Dialog open onOpenChange={(o) => !o && setCreating(false)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nouveau compte</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <label className="text-sm">Email
                <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              </label>
              <label className="text-sm">Nom complet
                <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={newUser.full_name} onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} />
              </label>
              <label className="text-sm">Téléphone
                <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">Département
                  <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}>
                    <option value="">—</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
                <label className="text-sm">Poste
                  <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={newUser.job_title} onChange={(e) => setNewUser({ ...newUser, job_title: e.target.value })} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">Statut
                  <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={newUser.account_status} onChange={(e) => setNewUser({ ...newUser, account_status: e.target.value as AccountStatus })}>
                    {(Object.keys(STATUS_LABEL) as AccountStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={newUser.mfa_required} onChange={(e) => setNewUser({ ...newUser, mfa_required: e.target.checked })} />
                  2FA obligatoire
                </label>
              </div>
              <div className="border-t pt-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Rôles attribués</p>
                <div className="grid gap-2">
                  {STAFF_ASSIGNABLE.map((role) => {
                    const checked = newUser.roles.includes(role);
                    return (
                      <label key={role} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                        <span className="text-sm">{ROLE_LABEL[role]}</span>
                        <input type="checkbox" checked={checked} onChange={(e) => {
                          setNewUser((prev) => ({
                            ...prev,
                            roles: e.target.checked
                              ? Array.from(new Set([...prev.roles, role]))
                              : prev.roles.filter((r) => r !== role),
                          }));
                        }} />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreating(false)}>Annuler</Button>
              <Button onClick={createUser}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total utilisateurs" value={stats.total} Icon={Users} />
        <StatCard label="Staff actif" value={stats.active} Icon={UserCheck} accent />
        <StatCard label="Suspendus" value={stats.suspended} Icon={UserX} />
        <StatCard label="Connexions 7j" value={stats.recentLogins} Icon={Clock} hint="Staff connecté cette semaine" />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher nom, email, poste…"
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Tous départements</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as AccountStatus | "")} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Tous statuts</option>
          {(Object.keys(STATUS_LABEL) as AccountStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Rôles</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Dernière connexion</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Chargement…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Aucun utilisateur.</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id} className="border-t border-border/60 align-middle hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-onyx/10 text-xs font-semibold uppercase">
                      {(u.full_name ?? u.email ?? "?").slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium">{u.full_name || "—"}</div>
                      {u.id === currentUser?.id && <span className="text-[10px] text-gold-deep">Vous</span>}
                      {u.mfa_required && <span className="ml-1 text-[10px] text-amber-600">2FA requis</span>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>{u.email ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{u.phone ?? "—"}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{u.department ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{u.job_title ?? "—"}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.roles.filter((r) => r !== "customer").map((r) => (
                      <span key={r} className="rounded-full bg-onyx px-2 py-0.5 text-[10px] text-white">{ROLE_LABEL[r]}</span>
                    ))}
                    {u.custom_roles.map((cr) => (
                      <span key={cr.id} className="rounded-full bg-gold-deep/20 px-2 py-0.5 text-[10px] text-gold-deep">{cr.name}</span>
                    ))}
                    {u.roles.length === 1 && u.roles[0] === "customer" && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">Client</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    u.account_status === "active" ? "bg-emerald-100 text-emerald-800"
                    : u.account_status === "suspended" ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-600"
                  }`}>
                    {STATUS_LABEL[u.account_status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {u.last_login_at ? new Date(u.last_login_at).toLocaleString("fr-FR") : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {hasPermission("user.edit") && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost"><MoreHorizontal className="size-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditing({ ...u })}>
                          <Pencil className="mr-2 size-4" />Modifier profil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setHistoryUser(u)}>
                          <Clock className="mr-2 size-4" />Historique connexions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(u.email)}>
                          <KeyRound className="mr-2 size-4" />Réinitialiser mot de passe
                        </DropdownMenuItem>
                        {u.account_status === "active" ? (
                          <DropdownMenuItem onClick={() => handleStatusChange(u.id, "suspended")}>
                            <Ban className="mr-2 size-4" />Suspendre
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleStatusChange(u.id, "active")}>
                            <CheckCircle className="mr-2 size-4" />Réactiver
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Dialog open onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Profil · {editing.full_name ?? editing.email}</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <label className="text-sm">Nom complet
                <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={editing.full_name ?? ""} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} />
              </label>
              <label className="text-sm">Téléphone
                <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={editing.phone ?? ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">Département
                  <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={editing.department ?? ""} onChange={(e) => setEditing({ ...editing, department: e.target.value })}>
                    <option value="">—</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
                <label className="text-sm">Poste
                  <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={editing.job_title ?? ""} onChange={(e) => setEditing({ ...editing, job_title: e.target.value })} />
                </label>
              </div>
              <label className="text-sm">Date d'embauche
                <input type="date" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={editing.hired_at?.slice(0, 10) ?? ""} onChange={(e) => setEditing({ ...editing, hired_at: e.target.value })} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.mfa_required} onChange={(e) => setEditing({ ...editing, mfa_required: e.target.checked })} />
                Double authentification obligatoire
              </label>

              <div className="border-t pt-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Rôles système</p>
                {STAFF_ASSIGNABLE.map((role) => {
                  const hasIt = editing.roles.includes(role);
                  return (
                    <label key={role} className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-3 py-2 mb-1">
                      <span className="text-sm">{ROLE_LABEL[role]}</span>
                      <input
                        type="checkbox" checked={hasIt}
                        onChange={() => toggleRole(editing.id, role, hasIt)}
                        disabled={editing.id === currentUser?.id && role === "super_admin" && hasIt}
                      />
                    </label>
                  );
                })}
              </div>

              {customRoles.length > 0 && (
                <div className="border-t pt-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Rôles personnalisés</p>
                  {customRoles.map((cr) => {
                    const hasIt = editing.custom_roles.some((c) => c.id === cr.id);
                    return (
                      <label key={cr.id} className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-3 py-2 mb-1">
                        <span className="text-sm">{cr.name}</span>
                        <input
                          type="checkbox" checked={hasIt}
                          onChange={async () => {
                            try {
                              if (hasIt) await removeCustomRole(editing.id, cr.id);
                              else await assignCustomRole(editing.id, cr.id);
                              toast.success(hasIt ? "Rôle retiré" : "Rôle attribué");
                              qc.invalidateQueries({ queryKey: ["admin-users"] });
                              const updated = { ...editing };
                              if (hasIt) updated.custom_roles = updated.custom_roles.filter((c) => c.id !== cr.id);
                              else updated.custom_roles = [...updated.custom_roles, { id: cr.id, name: cr.name }];
                              setEditing(updated);
                            } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Erreur"); }
                          }}
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
              <Button onClick={saveProfile}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {creating && (
        <Dialog open onOpenChange={(o) => !o && setCreating(false)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nouveau compte</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <label className="text-sm">Email
                <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              </label>
              <label className="text-sm">Nom complet
                <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={newUser.full_name} onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} />
              </label>
              <label className="text-sm">Téléphone
                <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">Département
                  <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}>
                    <option value="">—</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
                <label className="text-sm">Poste
                  <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={newUser.job_title} onChange={(e) => setNewUser({ ...newUser, job_title: e.target.value })} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">Statut
                  <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={newUser.account_status} onChange={(e) => setNewUser({ ...newUser, account_status: e.target.value as AccountStatus })}>
                    {(Object.keys(STATUS_LABEL) as AccountStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={newUser.mfa_required} onChange={(e) => setNewUser({ ...newUser, mfa_required: e.target.checked })} />
                  2FA obligatoire
                </label>
              </div>
              <div className="border-t pt-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Rôles attribués</p>
                <div className="grid gap-2">
                  {STAFF_ASSIGNABLE.map((role) => {
                    const checked = newUser.roles.includes(role);
                    return (
                      <label key={role} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                        <span className="text-sm">{ROLE_LABEL[role]}</span>
                        <input type="checkbox" checked={checked} onChange={(e) => {
                          setNewUser((prev) => ({
                            ...prev,
                            roles: e.target.checked
                              ? Array.from(new Set([...prev.roles, role]))
                              : prev.roles.filter((r) => r !== role),
                          }));
                        }} />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreating(false)}>Annuler</Button>
              <Button onClick={createUser}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {creating && (
        <Dialog open onOpenChange={(o) => !o && setCreating(false)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nouveau compte</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <label className="text-sm">Email
                <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              </label>
              <label className="text-sm">Nom complet
                <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={newUser.full_name} onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} />
              </label>
              <label className="text-sm">Téléphone
                <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">Département
                  <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}>
                    <option value="">—</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
                <label className="text-sm">Poste
                  <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={newUser.job_title} onChange={(e) => setNewUser({ ...newUser, job_title: e.target.value })} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">Statut
                  <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={newUser.account_status} onChange={(e) => setNewUser({ ...newUser, account_status: e.target.value as AccountStatus })}>
                    {(Object.keys(STATUS_LABEL) as AccountStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={newUser.mfa_required} onChange={(e) => setNewUser({ ...newUser, mfa_required: e.target.checked })} />
                  2FA obligatoire
                </label>
              </div>
              <div className="border-t pt-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Rôles attribués</p>
                <div className="grid gap-2">
                  {STAFF_ASSIGNABLE.map((role) => {
                    const checked = newUser.roles.includes(role);
                    return (
                      <label key={role} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                        <span className="text-sm">{ROLE_LABEL[role]}</span>
                        <input type="checkbox" checked={checked} onChange={(e) => {
                          setNewUser((prev) => ({
                            ...prev,
                            roles: e.target.checked
                              ? Array.from(new Set([...prev.roles, role]))
                              : prev.roles.filter((r) => r !== role),
                          }));
                        }} />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreating(false)}>Annuler</Button>
              <Button onClick={createUser}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {historyUser && (
        <Dialog open onOpenChange={(o) => !o && setHistoryUser(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Connexions · {historyUser.full_name}</DialogTitle></DialogHeader>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {loginHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune connexion enregistrée.</p>
              ) : loginHistory.map((h) => (
                <div key={h.id} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{new Date(h.created_at).toLocaleString("fr-FR")}</p>
                  <p className="text-xs text-muted-foreground truncate">{h.user_agent ?? "—"}</p>
                </div>
              ))}
            </div>
            <DialogFooter><Button onClick={() => setHistoryUser(null)}>Fermer</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
