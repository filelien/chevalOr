import { Link } from "@tanstack/react-router";
import {
  BedDouble, CalendarCheck, TrendingUp, Users, Presentation, UsersRound,
  Wallet, AlertTriangle, Activity, PartyPopper,
} from "lucide-react";
import type { ExtendedDashboardStats } from "@/lib/role-dashboard-stats";
import type { DashboardAlert } from "@/lib/admin-stats";
import { formatXOF } from "@/lib/rooms";
import { AlertCard } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { DashboardFrame, StatCard, QuickAction } from "./shared";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { LogIn, CreditCard, FileText } from "lucide-react";

export function ExecutiveDashboard({ stats }: { stats: ExtendedDashboardStats }) {
  return (
    <DashboardFrame
      kind="executive"
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild><Link to="/admin/reservations">+ Réservation</Link></Button>
          <Button variant="hero" size="sm" asChild><Link to="/admin/rapports">Rapports</Link></Button>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        <StatCard label="CA du jour" value={formatXOF(stats.revenue.today)} Icon={Wallet} accent />
        <StatCard label="CA du mois" value={formatXOF(stats.revenue.month)} Icon={TrendingUp} />
        <StatCard label="CA annuel" value={formatXOF(stats.revenue.year)} Icon={TrendingUp} />
        <StatCard label="Occupation" value={`${stats.rooms.occupancyRate}%`} Icon={BedDouble} />
        <StatCard label="Résa. en attente" value={stats.reservations.pending} Icon={CalendarCheck} />
        <StatCard label="Clients présents" value={stats.reservations.guestsInHouse} Icon={UsersRound} />
        <StatCard label="Conférence" value={stats.conferencePending} Icon={Presentation} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenus restaurant (mois)" value={formatXOF(stats.revenueByMonth.reduce((s, m) => s + m.restaurant, 0))} />
        <StatCard label="Revenus conférence (mois)" value={formatXOF(stats.operations.revenueConferenceMonth)} />
        <StatCard label="Revenus événements (mois)" value={formatXOF(stats.operations.revenueEventsMonth)} />
        <StatCard label="Dépenses (mois)" value={formatXOF(stats.operations.expensesMonth)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" />
            <h3 className="font-display text-xl">Centre d'alertes</h3>
          </div>
          {stats.alerts.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Tout est sous contrôle.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {stats.alerts.map((a: DashboardAlert) => (
                <li key={a.id}><AlertCard alert={a} /></li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-gold-deep" />
              <h3 className="font-display text-xl">Activité en direct</h3>
            </div>
            <Button variant="ghost" size="sm" asChild><Link to="/admin/activite">Journal</Link></Button>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {stats.recentActivity.slice(0, 8).map((a) => (
              <li key={a.id} className="flex justify-between gap-4 py-3 text-sm">
                <span><span className="font-medium capitalize">{a.action.toLowerCase()}</span>{a.details && <span className="text-muted-foreground"> — {a.details}</span>}</span>
                <time className="shrink-0 text-xs text-muted-foreground">{new Date(a.at).toLocaleString("fr-FR")}</time>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
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
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-display text-xl">Revenus par activité</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueByMonth}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: number) => formatXOF(v)} />
                <Legend />
                <Bar dataKey="hotel" fill="#C9A227" name="Hébergement" radius={[4, 4, 0, 0]} />
                <Bar dataKey="restaurant" fill="#2d3748" name="Restaurant" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Chambres" value={stats.rooms.total} Icon={BedDouble} />
        <StatCard label="Disponibles" value={stats.rooms.available} />
        <StatCard label="Occupées" value={stats.rooms.occupied} />
        <StatCard label="Clients CRM" value={stats.clients} Icon={Users} />
        <StatCard label="Événements à venir" value={stats.upcomingEvents} Icon={PartyPopper} />
      </div>
    </DashboardFrame>
  );
}

export function ReceptionDashboard({ stats }: { stats: ExtendedDashboardStats }) {
  return (
    <DashboardFrame
      kind="reception"
      actions={
        <div className="flex flex-wrap gap-2">
          <QuickAction to="/admin/reservations" label="Check-in" Icon={LogIn} />
          <QuickAction to="/admin/paiements" label="Encaisser" Icon={CreditCard} />
          <QuickAction to="/admin/planning" label="Planning" Icon={CalendarCheck} />
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Arrivées aujourd'hui" value={stats.operations.arrivalsToday} accent />
        <StatCard label="Départs aujourd'hui" value={stats.operations.departuresToday} />
        <StatCard label="Résa. en attente" value={stats.reservations.pending} />
        <StatCard label="Chambres libres" value={stats.rooms.available} Icon={BedDouble} />
        <StatCard label="À nettoyer" value={stats.rooms.cleaning} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-display text-lg">Arrivées du jour</h3>
          {stats.arrivalsList.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Aucune arrivée prévue.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {stats.arrivalsList.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{a.guest}</p>
                    <p className="text-xs text-muted-foreground">{a.reference} · Ch. {a.room}</p>
                  </div>
                  <Button size="sm" variant="outline" asChild><Link to="/admin/reservations">Voir</Link></Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-display text-lg">Départs du jour</h3>
          {stats.departuresList.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Aucun départ prévu.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {stats.departuresList.map((d) => (
                <li key={d.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{d.guest}</p>
                    <p className="text-xs text-muted-foreground">{d.reference} · Ch. {d.room}</p>
                  </div>
                  <Button size="sm" variant="outline" asChild><Link to="/admin/paiements">Facture</Link></Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <QuickAction to="/admin/reservations" label="Nouvelle résa." Icon={CalendarCheck} />
        <QuickAction to="/admin/clients" label="Clients" Icon={Users} />
        <QuickAction to="/admin/chambres" label="Chambres" Icon={BedDouble} />
        <QuickAction to="/admin/messages" label="Messages" Icon={FileText} />
      </div>
    </DashboardFrame>
  );
}

const ROOM_STATUS: Record<string, { label: string; color: string }> = {
  available: { label: "Propre / Disponible", color: "bg-emerald-100 text-emerald-800" },
  occupied: { label: "Occupée", color: "bg-blue-100 text-blue-800" },
  cleaning: { label: "À nettoyer", color: "bg-amber-100 text-amber-800" },
  maintenance: { label: "Maintenance", color: "bg-red-100 text-red-800" },
  reserved: { label: "Réservée", color: "bg-purple-100 text-purple-800" },
};

export function HousekeepingDashboard({ stats }: { stats: ExtendedDashboardStats }) {
  const clean = stats.rooms.available;
  const dirty = stats.rooms.cleaning + stats.rooms.occupied;
  return (
    <DashboardFrame kind="housekeeping">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Chambres propres" value={clean} accent />
        <StatCard label="À traiter" value={dirty} />
        <StatCard label="Maintenance" value={stats.rooms.maintenance} />
        <StatCard label="Prêtes" value={stats.rooms.available + stats.rooms.reserved} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.roomsByStatus.map((room) => {
          const st = ROOM_STATUS[room.status] ?? { label: room.status, color: "bg-secondary" };
          return (
            <div key={room.id} className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl">#{room.number}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${st.color}`}>{st.label}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{room.name}</p>
              <Button size="sm" variant="outline" className="mt-3 w-full" asChild>
                <Link to="/admin/chambres">Gérer</Link>
              </Button>
            </div>
          );
        })}
      </div>
    </DashboardFrame>
  );
}

export function RestaurantDashboard({ stats }: { stats: ExtendedDashboardStats }) {
  return (
    <DashboardFrame kind="restaurant" actions={<Button variant="hero" size="sm" asChild><Link to="/admin/restaurant">POS</Link></Button>}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="CA du jour" value={formatXOF(stats.operations.restaurantRevenueToday)} accent />
        <StatCard label="Tables réservées" value={stats.operations.tableReservationsToday} />
        <StatCard label="Commandes en cours" value={stats.operations.restaurantOrdersOpen} />
        <StatCard label="CA mois (resto)" value={formatXOF(stats.revenueByMonth.reduce((s, m) => s + m.restaurant, 0))} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["open", "preparing", "ready", "served"] as const).map((stage, i) => (
          <div key={stage} className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {["À préparer", "En cuisine", "Prêt", "Servi"][i]}
            </p>
            <p className="mt-2 font-display text-3xl tabular-nums">{stage === "open" ? stats.operations.restaurantOrdersOpen : 0}</p>
          </div>
        ))}
      </div>
    </DashboardFrame>
  );
}

export function AccountingDashboard({ stats }: { stats: ExtendedDashboardStats }) {
  const hotelMonth = stats.revenueByMonth.reduce((s, m) => s + m.hotel, 0);
  const restMonth = stats.revenueByMonth.reduce((s, m) => s + m.restaurant, 0);
  return (
    <DashboardFrame kind="accounting" actions={<Button variant="outline" size="sm" asChild><Link to="/admin/finance">Journal</Link></Button>}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenus hébergement" value={formatXOF(hotelMonth)} accent />
        <StatCard label="Revenus restaurant" value={formatXOF(restMonth)} />
        <StatCard label="Revenus conférence" value={formatXOF(stats.operations.revenueConferenceMonth)} />
        <StatCard label="Dépenses du mois" value={formatXOF(stats.operations.expensesMonth)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Non payées" value={stats.reservations.unpaid} hint="Réservations" />
        <StatCard label="CA du jour" value={formatXOF(stats.revenue.today)} />
        <StatCard label="CA annuel" value={formatXOF(stats.revenue.year)} />
      </div>
      <div className="flex flex-wrap gap-2">
        <QuickAction to="/admin/paiements" label="Paiements" Icon={CreditCard} />
        <QuickAction to="/admin/rapports" label="Rapports" Icon={FileText} />
        <QuickAction to="/admin/finance" label="Comptabilité" Icon={Wallet} />
      </div>
    </DashboardFrame>
  );
}

export function MarketingDashboard({ stats }: { stats: ExtendedDashboardStats }) {
  return (
    <DashboardFrame kind="marketing">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Avis à modérer" value={stats.operations.pendingReviews} accent />
        <StatCard label="Messages site" value={stats.siteInteractions} />
        <StatCard label="Résa. en attente" value={stats.reservations.pending} />
        <StatCard label="Notifications" value={stats.unreadNotifications} />
      </div>
      <div className="flex flex-wrap gap-2">
        <QuickAction to="/admin/marketing" label="Promotions" Icon={TrendingUp} />
        <QuickAction to="/admin/avis" label="Avis" Icon={Users} />
        <QuickAction to="/admin/campagnes" label="Campagnes" Icon={FileText} />
        <QuickAction to="/admin/site-web" label="Site web" Icon={Presentation} />
      </div>
    </DashboardFrame>
  );
}

export function ConferenceDashboard({ stats }: { stats: ExtendedDashboardStats }) {
  return (
    <DashboardFrame kind="conference" actions={<Button variant="hero" size="sm" asChild><Link to="/admin/conference">Planning</Link></Button>}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Aujourd'hui" value={stats.operations.conferenceToday} accent />
        <StatCard label="Cette semaine" value={stats.operations.conferenceWeek} />
        <StatCard label="Ce mois" value={stats.operations.conferenceMonth} />
        <StatCard label="En attente" value={stats.conferencePending} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Revenus conférence (mois)" value={formatXOF(stats.operations.revenueConferenceMonth)} />
        <StatCard label="Événements à venir" value={stats.upcomingEvents} />
      </div>
    </DashboardFrame>
  );
}
