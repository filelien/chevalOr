import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  fetchAuditLogsFiltered, fetchLoginHistory,
  auditActionBadge, AUDIT_MODULES, type AuditFilters,
} from "@/lib/audit";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAuth } from "@/lib/auth";
import { downloadCsv } from "@/lib/export-csv";
import { Button } from "@/components/ui/button";
import { Shield, Download, RefreshCw, Filter } from "lucide-react";
import { SystemHealthPanel } from "@/components/admin/SystemHealthPanel";

export const Route = createFileRoute("/_authenticated/admin/activite")({
  component: ActivitePage,
});

type Tab = "journal" | "logins" | "surveillance";

function ActivitePage() {
  const { hasPermission } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("journal");
  const [filters, setFilters] = useState<AuditFilters>({ limit: 500 });
  const [applied, setApplied] = useState<AuditFilters>({ limit: 500 });

  const { data: logs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["audit-logs", applied],
    queryFn: () => fetchAuditLogsFiltered(applied),
    enabled: hasPermission("audit.view") && tab === "journal",
  });

  const { data: logins = [] } = useQuery({
    queryKey: ["login-history"],
    queryFn: () => fetchLoginHistory(undefined, 200),
    enabled: hasPermission("audit.view") && tab !== "journal",
  });

  const failedLogins = useMemo(
    () => logins.filter((l: any) => l.success === false),
    [logins],
  );

  if (!hasPermission("audit.view")) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6 text-center">
        <Shield className="mx-auto size-12 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl">Accès refusé</h1>
      </div>
    );
  }

  function applyFilters() {
    setApplied({ ...filters, limit: 500 });
  }

  function exportCsv() {
    if (tab === "journal") {
      downloadCsv(
        `audit-${new Date().toISOString().slice(0, 10)}.csv`,
        ["Date", "Utilisateur", "Action", "Module", "Type", "ID", "IP", "Détails"],
        logs.map((r) => [
          new Date(r.created_at).toLocaleString("fr-FR"),
          r.user_email ?? "Système",
          r.action,
          r.module ?? "",
          r.entity_type ?? "",
          r.entity_id ?? "",
          r.ip_address ?? "",
          JSON.stringify(r.details ?? {}),
        ]),
      );
    } else {
      const rows = tab === "surveillance" ? failedLogins : logins;
      downloadCsv(
        `connexions-${new Date().toISOString().slice(0, 10)}.csv`,
        ["Date", "Utilisateur", "Succès", "IP", "Agent"],
        rows.map((r: any) => [
          new Date(r.created_at).toLocaleString("fr-FR"),
          r.profiles?.email ?? r.user_id ?? "",
          r.success ? "Oui" : "Non",
          r.ip_address ?? "",
          r.user_agent ?? "",
        ]),
      );
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "journal", label: "Journal détaillé" },
    { id: "logins", label: "Connexions" },
    { id: "surveillance", label: "Surveillance utilisateurs" },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminPageHeader
        label="Admin · Conformité"
        title="Journal d'audit"
        subtitle="Traçabilité complète : date, heure, utilisateur, IP, entité et valeurs modifiées."
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="mr-1 size-4" />Export CSV
          </Button>
          <Button variant="hero" size="sm" onClick={() => { refetch(); qc.invalidateQueries({ queryKey: ["login-history"] }); }} disabled={isFetching}>
            <RefreshCw className={`mr-1 size-4 ${isFetching ? "animate-spin" : ""}`} />Actualiser
          </Button>
        </div>
      </AdminPageHeader>

      <div className="flex flex-wrap gap-2 border-b border-border pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition ${
              tab === t.id ? "border-b-2 border-gold-deep text-gold-deep bg-gold-soft/20" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <SystemHealthPanel />

      {tab === "journal" && (
        <>
          <div className="audit-filter-bar rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              <input placeholder="Recherche…" value={filters.search ?? ""} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="rounded-md border border-input px-3 py-2 text-sm" />
              <input placeholder="Utilisateur" value={filters.user ?? ""} onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                className="rounded-md border border-input px-3 py-2 text-sm" />
              <input placeholder="IP" value={filters.ip ?? ""} onChange={(e) => setFilters({ ...filters, ip: e.target.value })}
                className="rounded-md border border-input px-3 py-2 text-sm" />
              <input placeholder="Type entité" value={filters.entityType ?? ""} onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                className="rounded-md border border-input px-3 py-2 text-sm" />
              <input placeholder="ID entité" value={filters.entityId ?? ""} onChange={(e) => setFilters({ ...filters, entityId: e.target.value })}
                className="rounded-md border border-input px-3 py-2 text-sm" />
              <select value={filters.module ?? "all"} onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                className="rounded-md border border-input px-3 py-2 text-sm">
                {AUDIT_MODULES.map((m) => <option key={m} value={m}>{m === "all" ? "Tous modules" : m}</option>)}
              </select>
              <input type="date" value={filters.dateFrom ?? ""} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="rounded-md border border-input px-3 py-2 text-sm" />
              <input type="date" value={filters.dateTo ?? ""} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="rounded-md border border-input px-3 py-2 text-sm" />
            </div>
            <Button variant="outline" size="sm" className="mt-3" onClick={applyFilters}>
              <Filter className="mr-1 size-4" />Filtrer
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-medium">Événements</span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">{logs.length}</span>
            </div>
            {isLoading ? (
              <p className="p-8 text-center text-muted-foreground">Chargement…</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="audit-table w-full min-w-[900px] text-sm">
                  <thead className="bg-[#f8f6f1] text-left text-[11px] font-bold uppercase tracking-widest text-foreground/70">
                    <tr>
                      <th className="p-3">Date / Heure</th>
                      <th className="p-3">Utilisateur</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Module</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">ID</th>
                      <th className="p-3">Détail / Valeurs</th>
                      <th className="p-3">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr><td colSpan={8} className="p-12 text-center text-muted-foreground">Aucune entrée d'audit.</td></tr>
                    ) : logs.map((row) => {
                      const badge = auditActionBadge(row.action);
                      const detail = row.details ? JSON.stringify(row.details, null, 0) : "—";
                      return (
                        <tr key={row.id} className="border-t border-border/50 hover:bg-secondary/15">
                          <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">
                            {new Date(row.created_at).toLocaleString("fr-FR")}
                          </td>
                          <td className="p-3 font-medium">{row.user_email ?? "Système"}</td>
                          <td className="p-3"><span className={badge.className}>{badge.label}</span></td>
                          <td className="p-3 uppercase text-xs">{row.module ?? "—"}</td>
                          <td className="p-3 text-xs">{row.entity_type ?? "—"}</td>
                          <td className="p-3 font-mono text-[10px] text-muted-foreground max-w-[80px] truncate" title={row.entity_id ?? ""}>
                            {row.entity_id?.slice(0, 8) ?? "—"}
                          </td>
                          <td className="p-3 max-w-[220px]">
                            <code className="audit-detail-json block truncate text-[10px] text-muted-foreground" title={detail}>{detail}</code>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground">{row.ip_address ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {(tab === "logins" || tab === "surveillance") && (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <span className="text-sm font-medium">
              {tab === "surveillance" ? "Tentatives échouées" : "Historique des connexions"}
            </span>
            <span className="ml-2 rounded-full bg-secondary px-2.5 py-0.5 text-xs">
              {tab === "surveillance" ? failedLogins.length : logins.length}
            </span>
          </div>
          <table className="audit-table w-full text-sm">
            <thead className="bg-[#f8f6f1] text-left text-[11px] font-bold uppercase tracking-widest text-foreground/70">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Utilisateur</th>
                <th className="p-3">Statut</th>
                <th className="p-3">IP</th>
                <th className="p-3">Navigateur</th>
              </tr>
            </thead>
            <tbody>
              {(tab === "surveillance" ? failedLogins : logins).length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">Aucune entrée.</td></tr>
              ) : (tab === "surveillance" ? failedLogins : logins).map((row: any) => (
                <tr key={row.id} className="border-t border-border/50">
                  <td className="p-3 text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString("fr-FR")}</td>
                  <td className="p-3">{(row.profiles as any)?.email ?? row.user_id?.slice(0, 8) ?? "—"}</td>
                  <td className="p-3">
                    <span className={row.success ? "audit-badge audit-badge--success" : "audit-badge audit-badge--danger"}>
                      {row.success ? "SUCCÈS" : "ÉCHEC"}
                    </span>
                  </td>
                  <td className="p-3 text-xs">{row.ip_address ?? "—"}</td>
                  <td className="p-3 max-w-xs truncate text-xs text-muted-foreground" title={row.user_agent ?? ""}>{row.user_agent ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
