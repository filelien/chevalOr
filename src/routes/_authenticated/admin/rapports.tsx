import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { formatXOF } from "@/lib/rooms";
import { useAdminI18n } from "@/hooks/use-admin-i18n";
import { AdminModuleLayout, AdminChartCard, AdminDataTable } from "@/components/admin/AdminModuleLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/export-csv";
import { fetchAdminReportData, type AdminReportsData } from "@/lib/reports";
import { printAdminReport } from "@/lib/report-branding";
import { HotelLogo } from "@/components/brand/HotelLogo";
import { CalendarDays, Download, Printer } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/rapports")({
  component: AdminReports,
});

const COLORS = ["#C9A227", "#1a1d24", "#4ade80", "#60a5fa", "#f97316"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function exportReport(data: AdminReportsData) {
  downloadCsv(
    `report-${new Date().toISOString().slice(0, 10)}.csv`,
    ["Catégorie", "Valeur"],
    [
      ["CA total", data.totals.totalRevenue],
      ["CA hôtel", data.totals.hotelRevenue],
      ["CA restaurant", data.totals.restaurantRevenue],
      ["Dépenses", data.totals.totalExpenses],
      ["Profit net", data.totals.netProfit],
      ["Clients actifs", data.totals.activeClients],
      ["Clients VIP", data.totals.vipClients],
    ].map((row) => row.map((value) => value ?? "")),
  );
}

function AdminReports() {
  const { ta } = useAdminI18n();
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  const { data, isLoading } = useQuery({
    queryKey: ["admin-report-data", from, to],
    queryFn: () => fetchAdminReportData({ from, to }),
  });

  const reservationStatusChart = useMemo(() => {
    return (data?.reservationStatus ?? []).map((row) => ({ name: row.status, value: row.count }));
  }, [data]);

  const financeByCategory = useMemo(() => data?.financeByCategory.slice(0, 6) ?? [], [data]);

  return (
    <AdminModuleLayout
      label={ta.reports.label}
      title={ta.reports.title}
      subtitle="Tableau de bord financier et opérationnel : réservations, restauration, clients, stock et performances métier."
      stats={data ? [
        { label: "CA total", value: formatXOF(data.totals.totalRevenue), accent: true },
        { label: "Profit net", value: formatXOF(data.totals.netProfit) },
        { label: "Clients actifs", value: data.totals.activeClients },
        { label: "Séjours confirmés", value: data.reservationStatus.find((s) => s.status === "confirmed")?.count ?? 0 },
      ] : []}
      actions={(
        <>
          <Button variant="outline" size="sm" onClick={() => data && printAdminReport(data, from, to)} disabled={!data || isLoading}>
            <Printer className="mr-1 size-4" />Imprimer PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => data && exportReport(data)} disabled={!data || isLoading}>
            <Download className="mr-1 size-4" />Exporter CSV
          </Button>
        </>
      )}
      toolbar={(
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <CalendarDays className="size-4 text-muted-foreground" />
            <span>Plage</span>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            De
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-md border border-input bg-background px-2 py-1 text-sm" />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            À
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-md border border-input bg-background px-2 py-1 text-sm" />
          </label>
        </div>
      )}
    >
      <div className="rounded-xl border border-border bg-gradient-to-r from-[#faf8f4] to-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <HotelLogo size="lg" tone="light" wrap />
          <div className="text-right text-sm text-muted-foreground">
            <p className="font-display text-lg text-foreground">Rapport d'activité</p>
            <p>Période {formatDate(from)} → {formatDate(to)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminChartCard title="Répartition CA">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data ? [
                  { name: "Hôtel", value: data.totals.hotelRevenue },
                  { name: "Restaurant", value: data.totals.restaurantRevenue },
                ] : []} dataKey="value" nameKey="name" outerRadius={90} label={({ name, value }) => `${name}: ${formatXOF(value)}`}>
                  {(data ? [0, 1] : []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => formatXOF(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard title="Réservations par statut">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reservationStatusChart} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#C9A227" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard title="Tendance CA">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.revenueTrend ?? []} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                <Tooltip formatter={(value: number) => formatXOF(value)} />
                <Line type="monotone" dataKey="hotel" stroke="#C9A227" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="restaurant" stroke="#1a1d24" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminChartCard title="Top chambres par CA">
          <div className="space-y-3">
            {data?.roomPerformance.map((room) => (
              <div key={room.roomId} className="rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{room.roomName} • n°{room.roomNumber}</div>
                    <div className="text-xs text-muted-foreground">{room.roomType} · {room.bookings} réservations</div>
                  </div>
                  <div className="text-right font-mono text-gold-deep">{formatXOF(room.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </AdminChartCard>

        <AdminChartCard title="Produits restaurant les plus vendus">
          <div className="space-y-3">
            {data?.topRestaurantProducts.map((item) => (
              <div key={item.name} className="rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.quantity} vendus</div>
                  </div>
                  <div className="text-right font-mono text-gold-deep">{formatXOF(item.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </AdminChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminDataTable>
          <table className="w-full text-sm">
            <thead className="bg-[#f8f6f1] text-left text-[11px] font-bold uppercase tracking-widest text-foreground/70">
              <tr>
                <th className="px-4 py-3">Pays</th>
                <th className="px-4 py-3">Clients</th>
              </tr>
            </thead>
            <tbody>
              {data?.clientCountries.map((row) => (
                <tr key={row.country} className="border-t border-border/50">
                  <td className="px-4 py-3">{row.country}</td>
                  <td className="px-4 py-3 font-medium">{row.clients}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminDataTable>

        <AdminDataTable>
          <table className="w-full text-sm">
            <thead className="bg-[#f8f6f1] text-left text-[11px] font-bold uppercase tracking-widest text-foreground/70">
              <tr>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Montant</th>
              </tr>
            </thead>
            <tbody>
              {financeByCategory.map((row) => (
                <tr key={row.category} className="border-t border-border/50">
                  <td className="px-4 py-3">{row.category}</td>
                  <td className="px-4 py-3 font-medium">{formatXOF(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminDataTable>

        <AdminDataTable>
          <table className="w-full text-sm">
            <thead className="bg-[#f8f6f1] text-left text-[11px] font-bold uppercase tracking-widest text-foreground/70">
              <tr>
                <th className="px-4 py-3">Produit critique</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Valeur</th>
              </tr>
            </thead>
            <tbody>
              {data?.lowStockItems.map((item) => (
                <tr key={item.id} className="border-t border-border/50">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3 font-medium">{item.quantity} / {item.min_threshold}</td>
                  <td className="px-4 py-3 font-mono">{formatXOF(item.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminDataTable>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl">Résumé métier</h2>
            <p className="text-sm text-muted-foreground">Période {formatDate(from)} → {formatDate(to)}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <div>CA hôtel : {formatXOF(data?.totals.hotelRevenue ?? 0)}</div>
            <div>CA restaurant : {formatXOF(data?.totals.restaurantRevenue ?? 0)}</div>
            <div>Clients VIP : {data?.totals.vipClients ?? 0}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm">
            <div className="text-muted-foreground">Total clients</div>
            <div className="mt-2 text-2xl font-semibold">{data?.totals.totalClients ?? 0}</div>
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm">
            <div className="text-muted-foreground">CA moyen commande</div>
            <div className="mt-2 text-2xl font-semibold">{formatXOF(data?.totals.averageOrderValue ?? 0)}</div>
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm">
            <div className="text-muted-foreground">Taux d’occupation</div>
            <div className="mt-2 text-2xl font-semibold">{data?.totals.occupancyRate ?? 0}%</div>
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm">
            <div className="text-muted-foreground">Séjour moyen</div>
            <div className="mt-2 text-2xl font-semibold">{data?.totals.averageStay.toFixed(1)} nuit(s)</div>
          </div>
        </div>
      </div>
    </AdminModuleLayout>
  );
}
