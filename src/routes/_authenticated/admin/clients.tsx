import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatXOF } from "@/lib/rooms";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/clients")({
  component: AdminClients,
});

function AdminClients() {
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-clients"],
    queryFn: async () => {
      const [{ data: profiles }, { data: reservations }] = await Promise.all([
        supabase.from("profiles").select("*").order("full_name"),
        supabase.from("reservations").select("profile_id, total_price, status, check_in"),
      ]);
      const byClient = new Map<string, { count: number; spent: number; last: string | null }>();
      (reservations ?? []).forEach((r: any) => {
        if (!r.profile_id) return;
        const s = byClient.get(r.profile_id) ?? { count: 0, spent: 0, last: null };
        s.count += 1;
        if (r.status !== "cancelled") s.spent += Number(r.total_price);
        if (!s.last || r.check_in > s.last) s.last = r.check_in;
        byClient.set(r.profile_id, s);
      });
      return (profiles ?? []).map((p: any) => ({ ...p, stats: byClient.get(p.id) ?? { count: 0, spent: 0, last: null } }));
    },
  });

  const filtered = useMemo(() => {
    if (!q) return data ?? [];
    const s = q.toLowerCase();
    return (data ?? []).filter((c: any) =>
      `${c.full_name ?? ""} ${c.email ?? ""} ${c.phone ?? ""}`.toLowerCase().includes(s)
    );
  }, [data, q]);

  return (
    <div className="p-6 lg:p-10">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Module 4 · CRM</span>
        <h1 className="mt-2 font-display text-4xl">Clients</h1>
      </div>

      <div className="mt-6 relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un client (nom, email, téléphone)…"
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm" />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Séjours</th>
              <th className="px-4 py-3">Total dépensé</th>
              <th className="px-4 py-3">Dernier séjour</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Chargement…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Aucun client.</td></tr>
            ) : filtered.map((c: any) => (
              <tr key={c.id} className="border-t border-border/60 hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <Link to="/admin/clients/$id" params={{ id: c.id }} className="font-medium hover:text-gold-deep">
                    {c.full_name || "Sans nom"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <div>{c.email ?? "—"}</div>
                  <div className="text-xs">{c.phone ?? ""}</div>
                </td>
                <td className="px-4 py-3">{c.stats.count}</td>
                <td className="px-4 py-3 text-gold-deep">{formatXOF(c.stats.spent)}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.stats.last ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}