import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BedDouble, CalendarCheck, TrendingUp, Sparkles } from "lucide-react";
import { formatXOF } from "@/lib/rooms";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [rooms, todayRes, occupied, revenue] = await Promise.all([
        supabase.from("rooms").select("id, status"),
        supabase.from("reservations").select("id").eq("check_in", today),
        supabase.from("rooms").select("id").eq("status", "occupied"),
        supabase.from("reservations").select("total_price").gte("check_in", today.slice(0, 7) + "-01"),
      ]);
      const total = rooms.data?.length ?? 0;
      const occ = occupied.data?.length ?? 0;
      const occRate = total ? Math.round((occ / total) * 100) : 0;
      const monthRevenue = (revenue.data ?? []).reduce((s: number, r: any) => s + Number(r.total_price), 0);
      return { total, occRate, todayCount: todayRes.data?.length ?? 0, monthRevenue };
    },
  });

  const cards = [
    { label: "Chambres", value: stats?.total ?? 0, Icon: BedDouble },
    { label: "Taux d'occupation", value: `${stats?.occRate ?? 0}%`, Icon: TrendingUp },
    { label: "Arrivées aujourd'hui", value: stats?.todayCount ?? 0, Icon: CalendarCheck },
    { label: "CA estimé (mois)", value: formatXOF(stats?.monthRevenue ?? 0), Icon: Sparkles },
  ];

  return (
    <div className="p-6 lg:p-10">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Tableau de bord</span>
        <h1 className="mt-2 font-display text-4xl">Vue d'ensemble</h1>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
              <Icon className="size-5 text-gold-deep" />
            </div>
            <p className="mt-3 font-display text-3xl">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-border bg-card p-8">
<<<<<<< HEAD
        <h2 className="font-display text-2xl">PMS Cheval d'Or — opérationnel</h2>
        <p className="mt-2 text-muted-foreground">
          Tous les modules sont actifs : chambres, planning, réservations, CRM clients, restaurant/POS,
          stock, finance, rapports, utilisateurs et inbox (contact, newsletter, tables).
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>✓ Vérification disponibilité anti double-réservation</li>
          <li>✓ Codes promo (CHEVAL20, WEEKEND, TABLE15)</li>
          <li>✓ Factures PDF client</li>
          <li>✓ Gestion des messages entrants</li>
        </ul>
=======
        <h2 className="font-display text-2xl">Bienvenue dans votre PMS</h2>
        <p className="mt-2 text-muted-foreground">
          Le socle est en place : authentification, rôles, gestion des chambres et site client.
          Les modules suivants (réservations avancées, restaurant/POS, stock, finance, rapports)
          seront ajoutés progressivement.
        </p>
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
      </div>
    </div>
  );
}