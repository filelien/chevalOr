import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "@/lib/audit";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAuth } from "@/lib/auth";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/activite")({
  component: ActivitePage,
});

function ActivitePage() {
  const { hasPermission } = useAuth();
  const { data = [], isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => fetchAuditLogs(150),
    enabled: hasPermission("audit.view"),
  });

  if (!hasPermission("audit.view")) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6 text-center">
        <Shield className="mx-auto size-12 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl">Accès refusé</h1>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Audit"
        title="Journal d'activité"
        subtitle="Traçabilité complète : qui, quand, quelle action, sur quel module."
      />
      {isLoading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Utilisateur</th>
                <th className="p-3">Action</th>
                <th className="p-3">Module</th>
                <th className="p-3">Entité</th>
                <th className="p-3">Détails</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Aucune entrée d'audit.</td></tr>
              ) : data.map((row) => (
                <tr key={row.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="p-3 whitespace-nowrap text-muted-foreground">
                    {new Date(row.created_at).toLocaleString("fr-FR")}
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{row.user_email ?? "Système"}</div>
                  </td>
                  <td className="p-3 font-medium capitalize">{row.action?.replace(/_/g, " ")}</td>
                  <td className="p-3">{row.module ?? "—"}</td>
                  <td className="p-3 text-xs">{row.entity_type}{row.entity_id ? ` #${row.entity_id.slice(0, 8)}` : ""}</td>
                  <td className="p-3 max-w-xs truncate text-muted-foreground text-xs">
                    {typeof row.details === "object" ? JSON.stringify(row.details) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
