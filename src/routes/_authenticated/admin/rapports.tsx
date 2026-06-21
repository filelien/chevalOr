import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatXOF } from "@/lib/rooms";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/_authenticated/admin/rapports")({
  component: AdminReports,
});

const COLORS = ["#C9A227", "#1a1a1a", "#4ade80", "#60a5fa", "#f97316"];

function AdminReports() {
  const { data: reservations } = useQuery({
    queryKey: ["reports-res"],
    queryFn: async () => {
      const { data } = await supabase.from("reservations").select("status, total_price, check_in, room_id, rooms(type)");
      return data ?? [];
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["reports-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("restaurant_orders").select("total, status, created_at").eq("status", "paid");
      return data ?? [];
    },
  });

  const { data: rooms } = useQuery({
    queryKey: ["reports-rooms"],
    queryFn: async () => {
      const { data } = await supabase.from("rooms").select("status");
      return data ?? [];
    },
  });

  const statusChart = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of reservations ?? []) counts[r.status] = (counts[r.status] ?? 0) + 1;
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [reservations]);

  const roomStatusChart = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of rooms ?? []) counts[r.status] = (counts[r.status] ?? 0) + 1;
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [rooms]);

  const revenue = useMemo(() => {
    const hotel = (reservations ?? []).reduce((s, r) => s + Number(r.total_price ?? 0), 0);
    const rest = (orders ?? []).reduce((s, o) => s + Number(o.total ?? 0), 0);
    return [{ name: "Hôtel", value: hotel }, { name: "Restaurant", value: rest }];
  }, [reservations, orders]);

  return (
    <div className="p-6 lg:p-10">
      <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Rapports</span>
      <h1 className="mt-2 font-display text-4xl">Analytique</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">Répartition revenus</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revenue} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${formatXOF(value)}`}>
                  {revenue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatXOF(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">Réservations par statut</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChart}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#C9A227" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <h2 className="font-display text-xl">Statut des chambres</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomStatusChart}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
