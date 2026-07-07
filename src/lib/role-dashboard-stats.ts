import { supabase } from "@/integrations/supabase/client";
import { fetchDashboardStats, type DashboardStats } from "@/lib/admin-stats";

export type ExtendedDashboardStats = DashboardStats & {
  operations: {
    arrivalsToday: number;
    departuresToday: number;
    tableReservationsToday: number;
    restaurantOrdersOpen: number;
    restaurantRevenueToday: number;
    conferenceToday: number;
    conferenceWeek: number;
    conferenceMonth: number;
    pendingReviews: number;
    expensesMonth: number;
    revenueConferenceMonth: number;
    revenueEventsMonth: number;
  };
  arrivalsList: { id: string; reference: string; guest: string; room: string; status: string }[];
  departuresList: { id: string; reference: string; guest: string; room: string }[];
  roomsByStatus: { id: string; number: string; name: string; status: string }[];
};

export async function fetchExtendedDashboardStats(): Promise<ExtendedDashboardStats> {
  const base = await fetchDashboardStats();
  const today = new Date().toISOString().slice(0, 10);
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().slice(0, 10);
  const month = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const [
    resDetailRes,
    roomsRes,
    tableResRes,
    ordersOpenRes,
    ordersTodayRes,
    confRes,
    reviewsRes,
    expensesRes,
    eventsRes,
  ] = await Promise.all([
    supabase
      .from("reservations")
      .select("id, reference, status, check_in, check_out, profiles(full_name), rooms(number, name)")
      .or(`check_in.eq.${today},check_out.eq.${today}`)
      .neq("status", "cancelled"),
    supabase.from("rooms").select("id, number, name, status").order("number"),
    supabase.from("table_reservations").select("id", { count: "exact", head: true }).eq("reservation_date", today),
    supabase.from("restaurant_orders").select("id", { count: "exact", head: true }).in("status", ["open", "preparing"]),
    supabase.from("restaurant_orders").select("total").eq("status", "paid").gte("created_at", `${today}T00:00:00`),
    supabase.from("conference_bookings").select("id, booking_date, price, status"),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_published", false),
    supabase.from("financial_records").select("amount").eq("type", "expense").gte("record_date", `${month}-01`),
    supabase.from("event_bookings").select("price, event_date, status").gte("event_date", `${month}-01`),
  ]);

  const reservations = resDetailRes.data ?? [];
  const arrivals = reservations.filter((r) => r.check_in === today);
  const departures = reservations.filter((r) => r.check_out === today);

  const conferences = confRes.data ?? [];
  const confToday = conferences.filter((c) => c.booking_date === today).length;
  const confWeek = conferences.filter((c) => c.booking_date >= today && c.booking_date <= weekEndStr).length;
  const confMonth = conferences.filter((c) => c.booking_date?.startsWith(month)).length;
  const revenueConferenceMonth = conferences
    .filter((c) => c.booking_date?.startsWith(month) && c.status !== "cancelled")
    .reduce((s, c) => s + Number(c.price ?? 0), 0);

  const events = eventsRes.data ?? [];
  const revenueEventsMonth = events
    .filter((e) => e.status !== "cancelled")
    .reduce((s, e) => s + Number(e.price ?? 0), 0);

  const expensesMonth = (expensesRes.data ?? []).reduce((s, e) => s + Number(e.amount ?? 0), 0);

  const mapRes = (r: (typeof reservations)[0]) => ({
    id: r.id,
    reference: r.reference ?? "—",
    guest: (r.profiles as { full_name?: string } | null)?.full_name ?? "—",
    room: r.rooms ? `${(r.rooms as { number?: string; name?: string }).number ?? ""} ${(r.rooms as { name?: string }).name ?? ""}`.trim() : "—",
    status: r.status,
  });

  return {
    ...base,
    operations: {
      arrivalsToday: arrivals.length,
      departuresToday: departures.length,
      tableReservationsToday: tableResRes.count ?? 0,
      restaurantOrdersOpen: ordersOpenRes.count ?? 0,
      restaurantRevenueToday: (ordersTodayRes.data ?? []).reduce((s, o) => s + Number(o.total ?? 0), 0),
      conferenceToday: confToday,
      conferenceWeek: confWeek,
      conferenceMonth: confMonth,
      pendingReviews: reviewsRes.count ?? 0,
      expensesMonth,
      revenueConferenceMonth,
      revenueEventsMonth,
    },
    arrivalsList: arrivals.map(mapRes),
    departuresList: departures.map((r) => mapRes(r)),
    roomsByStatus: (roomsRes.data ?? []).map((r) => ({
      id: r.id,
      number: String(r.number),
      name: r.name ?? "",
      status: r.status,
    })),
  };
}
