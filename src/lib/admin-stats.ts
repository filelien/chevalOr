import { supabase } from "@/integrations/supabase/client";

export type DashboardStats = {
  reservations: {
    total: number;
    today: number;
    pending: number;
    confirmed: number;
    cancelled: number;
  };
  rooms: {
    total: number;
    available: number;
    occupied: number;
    maintenance: number;
    cleaning: number;
    reserved: number;
    occupancyRate: number;
  };
  revenue: {
    today: number;
    month: number;
    year: number;
  };
  clients: number;
  siteInteractions: number;
  conferencePending: number;
  unreadNotifications: number;
  reservationsByDay: { date: string; count: number }[];
  revenueByMonth: { month: string; hotel: number; restaurant: number }[];
  recentActivity: { id: string; action: string; details: string; at: string }[];
};

function monthStart(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function yearStart(d = new Date()) {
  return `${d.getFullYear()}-01-01`;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString().slice(0, 10);
  const month = monthStart();
  const year = yearStart();

  const [
    roomsRes,
    reservationsRes,
    profilesRes,
    contactRes,
    newsletterRes,
    ordersTodayRes,
    ordersMonthRes,
    ordersYearRes,
    conferenceRes,
    notifRes,
    activityRes,
  ] = await Promise.all([
    supabase.from("rooms").select("id, status"),
    supabase.from("reservations").select("id, status, check_in, total_price, created_at, reference"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }),
    supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
    supabase.from("restaurant_orders").select("total").eq("status", "paid").gte("created_at", `${today}T00:00:00`),
    supabase.from("restaurant_orders").select("total").eq("status", "paid").gte("created_at", `${month}T00:00:00`),
    supabase.from("restaurant_orders").select("total").eq("status", "paid").gte("created_at", `${year}T00:00:00`),
    supabase.from("conference_bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("admin_notifications").select("id", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("activity_log").select("id, action, entity_type, details, created_at").order("created_at", { ascending: false }).limit(8),
  ]);

  const rooms = roomsRes.data ?? [];
  const reservations = reservationsRes.data ?? [];

  const roomCounts = { available: 0, occupied: 0, maintenance: 0, cleaning: 0, reserved: 0 };
  for (const r of rooms) {
    const s = r.status as keyof typeof roomCounts;
    if (s in roomCounts) roomCounts[s]++;
  }
  const totalRooms = rooms.length;
  const occupancyRate = totalRooms ? Math.round((roomCounts.occupied / totalRooms) * 100) : 0;

  const resToday = reservations.filter((r) => r.check_in === today);
  const pending = reservations.filter((r) => r.status === "pending").length;
  const confirmed = reservations.filter((r) => r.status === "confirmed" || r.status === "checked_in").length;
  const cancelled = reservations.filter((r) => r.status === "cancelled").length;

  const hotelToday = reservations
    .filter((r) => r.check_in === today && r.status !== "cancelled")
    .reduce((s, r) => s + Number(r.total_price ?? 0), 0);
  const hotelMonth = reservations
    .filter((r) => r.check_in >= month && r.status !== "cancelled")
    .reduce((s, r) => s + Number(r.total_price ?? 0), 0);
  const hotelYear = reservations
    .filter((r) => r.check_in >= year && r.status !== "cancelled")
    .reduce((s, r) => s + Number(r.total_price ?? 0), 0);

  const restToday = (ordersTodayRes.data ?? []).reduce((s, o) => s + Number(o.total ?? 0), 0);
  const restMonth = (ordersMonthRes.data ?? []).reduce((s, o) => s + Number(o.total ?? 0), 0);
  const restYear = (ordersYearRes.data ?? []).reduce((s, o) => s + Number(o.total ?? 0), 0);

  const dayMap: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const r of reservations) {
    const d = r.created_at?.slice(0, 10);
    if (d && d in dayMap) dayMap[d]++;
  }
  const reservationsByDay = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const revenueByMonth = monthNames.map((label, i) => {
    const m = `${new Date().getFullYear()}-${String(i + 1).padStart(2, "0")}`;
    const hotel = reservations
      .filter((r) => r.check_in?.startsWith(m) && r.status !== "cancelled")
      .reduce((s, r) => s + Number(r.total_price ?? 0), 0);
    return { month: label, hotel, restaurant: 0 };
  });

  const recentActivity = (activityRes.data ?? []).map((a) => ({
    id: a.id,
    action: a.action,
    details: `${a.entity_type ?? ""} ${(a.details as { reference?: string })?.reference ?? ""}`.trim(),
    at: a.created_at,
  }));

  return {
    reservations: {
      total: reservations.length,
      today: resToday.length,
      pending,
      confirmed,
      cancelled,
    },
    rooms: { total: totalRooms, ...roomCounts, occupancyRate },
    revenue: {
      today: hotelToday + restToday,
      month: hotelMonth + restMonth,
      year: hotelYear + restYear,
    },
    clients: profilesRes.count ?? 0,
    siteInteractions: (contactRes.count ?? 0) + (newsletterRes.count ?? 0),
    conferencePending: conferenceRes.count ?? 0,
    unreadNotifications: notifRes.count ?? 0,
    reservationsByDay,
    revenueByMonth,
    recentActivity,
  };
}
