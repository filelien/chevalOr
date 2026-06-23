import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BedDouble, CalendarCheck, TrendingUp, Users, Globe, Presentation,
  XCircle, Clock, CheckCircle2, Wrench, Bell,
} from "lucide-react";
import { fetchDashboardStats } from "@/lib/admin-stats";
import { formatXOF } from "@/lib/rooms";
import { AdminPageHeader, StatCard } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchDashboardStats,
    refetchInterval: 120_000,
  });

  if (isLoading || !stats) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-10 text-muted-foreground">
        Chargement du tableau de bord…
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-10">
      <AdminPageHeader
        label="Hôtel Le Cheval d'Or — Anié"
        title="Tableau de bord"
        subtitle="Vue d'ensemble en temps réel : hébergement, événements, finances et activité du site."
      >
        <div className="flex gap-2">
          <Button variant="goldOutline" size="sm" asChild>
            <Link to="/admin/notifications">
              <Bell className="mr-1 size-4" />
              {stats.unreadNotifications > 0 ? `${stats.unreadNotifications} alertes` : "Notifications"}
            </Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/admin/reservations">Réservations</Link>
          </Button>
        </div>
      </AdminPageHeader>

      {/* Réservations */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-deep">Réservations</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total" value={stats.reservations.total} Icon={CalendarCheck} />
          <StatCard label="Aujourd'hui" value={stats.reservations.today} Icon={CalendarCheck} />
          <StatCard label="En attente" value={stats.reservations.pending} Icon={Clock} />
          <StatCard label="Confirmées" value={stats.reservations.confirmed} Icon={CheckCircle2} />
          <StatCard label="Annulées" value={stats.reservations.cancelled} Icon={XCircle} />
        </div>
      </section>

      {/* Chambres */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-deep">Chambres</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <StatCard label="Total" value={stats.rooms.total} Icon={BedDouble} />
          <StatCard label="Disponibles" value={stats.rooms.available} />
          <StatCard label="Occupées" value={stats.rooms.occupied} />
          <StatCard label="Maintenance" value={stats.rooms.maintenance} Icon={Wrench} />
          <StatCard label="Taux d'occupation" value={`${stats.rooms.occupancyRate}%`} Icon={TrendingUp} />
          <StatCard label="Conférence en attente" value={stats.conferencePending} Icon={Presentation} />
        </div>
      </section>

      {/* Revenus & clients */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-deep">Finances & audience</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Revenus du jour" value={formatXOF(stats.revenue.today)} Icon={TrendingUp} />
          <StatCard label="Revenus du mois" value={formatXOF(stats.revenue.month)} />
          <StatCard label="Revenus annuels" value={formatXOF(stats.revenue.year)} />
          <StatCard label="Clients enregistrés" value={stats.clients} Icon={Users} />
          <StatCard label="Interactions site" value={stats.siteInteractions} Icon={Globe} hint="Messages + newsletter" />
        </div>
      </section>

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
          <h3 className="font-display text-xl">Revenus hébergement (mois)</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueByMonth}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: number) => formatXOF(v)} />
                <Bar dataKey="hotel" fill="#C9A227" name="Hôtel" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl">Activités récentes</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/reservations">Voir tout</Link>
          </Button>
        </div>
        {stats.recentActivity.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Aucune activité enregistrée pour le moment.</p>
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

      {/* Accès rapides modules */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-display text-xl">Modules PMS actifs</h3>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Chambres & stock", "/admin/chambres"],
            ["Planning & réservations", "/admin/planning"],
            ["CRM clients", "/admin/clients"],
            ["Salle de conférence", "/admin/conference"],
            ["Restaurant / POS", "/admin/restaurant"],
            ["Finances & rapports", "/admin/finance"],
            ["Marketing & promos", "/admin/marketing"],
            ["CMS site web & SEO", "/admin/site-web"],
            ["Messages & avis", "/admin/messages"],
          ].map(([label, to]) => (
            <Link key={to} to={to as "/admin"} className="rounded-lg border border-border/60 px-4 py-3 hover:border-gold/40 hover:bg-secondary/50">
              → {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
