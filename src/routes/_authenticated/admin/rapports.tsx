import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatXOF } from "@/lib/rooms";
import { useAdminI18n } from "@/hooks/use-admin-i18n";
import { AdminModuleLayout, AdminChartCard } from "@/components/admin/AdminModuleLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/admin/rapports")({
  component: AdminReports,
});

const COLORS = ["#C9A227", "#1a1d24", "#4ade80", "#60a5fa", "#f97316"];

function AdminReports() {
  const { ta } = useAdminI18n();

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

  const monthlyTrend = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const r of reservations ?? []) {
      const m = (r.check_in as string)?.slice(0, 7);
      if (m) byMonth.set(m, (byMonth.get(m) ?? 0) + Number(r.total_price ?? 0));
    }
    return [...byMonth.entries()].sort().slice(-6).map(([month, total]) => ({ month, total }));
  }, [reservations]);

  const totalRev = revenue.reduce((s, r) => s + r.value, 0);

  return (
    <AdminModuleLayout
      label={ta.reports.label}
      title={ta.reports.title}
      subtitle={ta.reports.subtitle}
      stats={[
        { label: ta.finance.hotelRevenue, value: formatXOF(revenue[0]?.value ?? 0), accent: true },
        { label: ta.finance.restRevenue, value: formatXOF(revenue[1]?.value ?? 0) },
        { label: ta.common.total, value: formatXOF(totalRev) },
        { label: ta.nav.reservations, value: reservations?.length ?? 0 },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminChartCard title={ta.reports.revenueSplit}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revenue} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${formatXOF(value)}`}>
                  {revenue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatXOF(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard title={ta.reports.resByStatus}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChart}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#C9A227" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard title={ta.dashboard.revenue6m} className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: number) => formatXOF(v)} />
                <Line type="monotone" dataKey="total" stroke="#C9A227" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard title={ta.reports.roomStatus} className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomStatusChart}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#1a1d24" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>
      </div>
    </AdminModuleLayout>
  );
}
