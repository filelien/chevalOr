import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchLoginHistory } from "@/lib/audit";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/export-csv";
import { Download, AlertTriangle } from "lucide-react";
import { SystemHealthPanel } from "@/components/admin/SystemHealthPanel";

export const Route = createFileRoute("/_authenticated/admin/surveillance")({
  component: AdminSurveillance,
});

function AdminSurveillance() {
  const { data: logins = [], isLoading } = useQuery({
    queryKey: ["surveillance-logins"],
    queryFn: () => fetchLoginHistory(undefined, 300),
  });

  const failed = logins.filter((l: any) => !l.success);
  const recent = logins.slice(0, 50);

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminPageHeader
        label="Administration · Conformité"
        title="Surveillance utilisateurs"
        subtitle="Monitoring des connexions, tentatives échouées et activité suspecte."
      >
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadCsv(
            "surveillance-connexions.csv",
            ["Date", "Utilisateur", "Succès", "IP", "Agent"],
            logins.map((r: any) => [
              new Date(r.created_at).toLocaleString("fr-FR"),
              r.profiles?.email ?? r.user_id ?? "",
              r.success ? "Oui" : "Non",
              r.ip_address ?? "",
              r.user_agent ?? "",
            ]),
          )}>
            <Download className="mr-1 size-4" />Export
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/admin/activite">Journal complet</Link>
          </Button>
        </div>
      </AdminPageHeader>

      <SystemHealthPanel />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stat-card-premium rounded-xl p-5">
          <p className="text-xs uppercase text-muted-foreground">Connexions (24h)</p>
          <p className="mt-2 font-display text-3xl">{logins.length}</p>
        </div>
        <div className="stat-card-premium accent rounded-xl p-5">
          <p className="text-xs uppercase text-muted-foreground">Échecs</p>
          <p className="mt-2 font-display text-3xl text-red-600">{failed.length}</p>
        </div>
        <div className="stat-card-premium rounded-xl p-5">
          <p className="text-xs uppercase text-muted-foreground">Taux succès</p>
          <p className="mt-2 font-display text-3xl">
            {logins.length ? Math.round(((logins.length - failed.length) / logins.length) * 100) : 100}%
          </p>
        </div>
      </div>

      {failed.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle className="size-5 shrink-0" />
          {failed.length} tentative(s) de connexion échouée(s) détectée(s).
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="audit-table w-full text-sm">
          <thead className="bg-[#f8f6f1] text-left text-[11px] font-bold uppercase tracking-widest text-foreground/70">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Utilisateur</th>
              <th className="p-3">Statut</th>
              <th className="p-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Chargement…</td></tr>
            ) : recent.map((r: any) => (
              <tr key={r.id} className="border-t border-border/50">
                <td className="p-3 text-xs">{new Date(r.created_at).toLocaleString("fr-FR")}</td>
                <td className="p-3">{(r.profiles as any)?.email ?? "—"}</td>
                <td className="p-3">
                  <span className={r.success ? "audit-badge audit-badge--success" : "audit-badge audit-badge--danger"}>
                    {r.success ? "SUCCÈS" : "ÉCHEC"}
                  </span>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{r.ip_address ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
