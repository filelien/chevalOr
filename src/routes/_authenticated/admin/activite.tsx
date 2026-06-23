import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/_authenticated/admin/activite")({
  component: ActivitePage,
});

function ActivitePage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["activity-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Audit"
        title="Journal d'activité"
        subtitle="Historique des actions sur réservations, paiements et modules PMS."
      />
      {isLoading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entité</th>
                <th className="p-3">Détails</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-border/50">
                  <td className="p-3 whitespace-nowrap text-muted-foreground">
                    {new Date(row.created_at).toLocaleString("fr-FR")}
                  </td>
                  <td className="p-3 font-medium capitalize">{row.action?.toLowerCase()}</td>
                  <td className="p-3">{row.entity_type ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{JSON.stringify(row.details ?? {})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
