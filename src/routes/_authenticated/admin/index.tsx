import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BedDouble, CalendarCheck, TrendingUp, Users, Presentation, UsersRound,
  Wallet, AlertTriangle, Activity, PartyPopper,
} from "lucide-react";
import { fetchDashboardStats, type DashboardAlert } from "@/lib/admin-stats";
import { formatXOF } from "@/lib/rooms";
import { AdminPageHeader, StatCard, AlertCard } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchDashboardStats,
    refetchInterval: 90_000,
  });

  if (isLoading || !stats) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-10 text-muted-foreground">
        Chargement du centre de commande…
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Centre de commande exécutif"
        title="Tableau de bord"
        subtitle="Pilotage en temps réel : hébergement, finances, événements et activité digitale."
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/reservations">+ Réservation</Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/admin/planning">Planning</Link>
          </Button>
        </div>
      </AdminPageHeader>

      {/* KPIs exécutifs */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        <StatCard label="CA du jour" value={formatXOF(stats.revenue.today)} Icon={Wallet} accent />
        <StatCard label="CA du mois" value={formatXOF(stats.revenue.month)} Icon={TrendingUp} />
        <StatCard label="Taux d'occupation" value={`${stats.rooms.occupancyRate}%`} Icon={BedDouble} />
        <StatCard label="Résa. en attente" value={stats.reservations.pending} Icon={CalendarCheck} />
        <StatCard label="Clients présents" value={stats.reservations.guestsInHouse} Icon={UsersRound} />
        <StatCard label="Événements à venir" value={stats.upcomingEvents} Icon={PartyPopper} />
        <StatCard label="Conférence pending" value={stats.conferencePending} Icon={Presentation} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Centre d'alertes */}
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" />
            <h3 className="font-display text-xl">Centre d'alertes</h3>
          </div>
          {stats.alerts.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Aucune alerte — tout est sous contrôle.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {stats.alerts.map((a: DashboardAlert) => (
                <li key={a.id}>
                  <AlertCard alert={a} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Activité temps réel */}
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-gold-deep" />
              <h3 className="font-display text-xl">Activité en temps réel</h3>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/activite">Journal complet</Link>
            </Button>
          </div>
          {stats.recentActivity.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Aucune activité récente.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {stats.recentActivity.map((a) => (
                <li key={a.id} className="flex justify-between gap-4 py-3 text-sm">
                  <span>
                    <span className="font-medium capitalize">{a.action.toLowerCase()}</span>
                    {a.details && <span className="text-muted-foreground"> — {a.details}</span>}
                  </span>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {new Date(a.at).toLocaleString("fr-FR")}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-display text-xl">Réservations (14 jours)</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.reservationsByDay}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#C9A227" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-display text-xl">Revenus par segment</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueByMonth}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: number) => formatXOF(v)} />
                <Legend />
                <Bar dataKey="hotel" fill="#C9A227" name="Hôtel" radius={[4, 4, 0, 0]} />
                <Bar dataKey="restaurant" fill="#2d3748" name="Restaurant" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Synthèse chambres & clients */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Chambres totales" value={stats.rooms.total} Icon={BedDouble} />
        <StatCard label="Disponibles" value={stats.rooms.available} />
        <StatCard label="Occupées" value={stats.rooms.occupied} />
        <StatCard label="Clients CRM" value={stats.clients} Icon={Users} />
        <StatCard label="Non payées" value={stats.reservations.unpaid} hint="Voir paiements" />
      </div>
    </div>
  );
}
