import { supabase } from "@/integrations/supabase/client";
import type { ReservationStatus } from "@/lib/reservations";
import type { OrderStatus } from "@/lib/restaurant";

export type ReportPeriod = { from: string; to: string };

export type RoomPerformanceRow = {
  roomId: string;
  roomNumber: string;
  roomName: string;
  roomType: string;
  bookings: number;
  revenue: number;
};

export type RestaurantProductRow = {
  name: string;
  quantity: number;
  revenue: number;
};

export type CountryClientRow = {
  country: string;
  clients: number;
};

export type FinanceCategoryRow = {
  category: string;
  amount: number;
};

export type AdminReportsData = {
  totals: {
    totalRevenue: number;
    hotelRevenue: number;
    restaurantRevenue: number;
    totalReservations: number;
    averageStay: number;
    occupancyRate: number;
    totalClients: number;
    activeClients: number;
    newClients: number;
    vipClients: number;
    totalExpenses: number;
    netProfit: number;
    averageOrderValue: number;
  };
  reservationStatus: Array<{ status: string; count: number; revenue: number }>;
  revenueTrend: Array<{ label: string; hotel: number; restaurant: number; net: number }>;
  roomPerformance: RoomPerformanceRow[];
  topRestaurantProducts: RestaurantProductRow[];
  lowStockItems: Array<{
    id: string;
    name: string;
    quantity: number;
    min_threshold: number;
    unit_cost: number | null;
    value: number;
  }>;
  clientCountries: CountryClientRow[];
  financeByCategory: FinanceCategoryRow[];
  orderStatusCounts: Array<{ status: string; count: number; total: number }>;
  dateRange: ReportPeriod;
};

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric" }).format(date);
}

function groupBy<T, K extends string | number>(items: T[], keyFn: (item: T) => K) {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return map;
}

function clampPercentage(value: number) {
  if (Number.isFinite(value)) return Math.max(0, Math.min(100, Math.round(value)));
  return 0;
}

export async function fetchAdminReportData(range?: ReportPeriod): Promise<AdminReportsData> {
  const from = range?.from;
  const to = range?.to;
  const reservationQuery = supabase.from("reservations").select(
    "*, rooms(number, name, type, price_per_night), profiles(full_name, email, country)"
  );
  const ordersQuery = supabase.from("restaurant_orders").select("*, order_items(*)");
  const inventoryQuery = supabase.from("inventory_items").select("*");
  const profilesQuery = supabase.from("profiles").select("*");
  const financeQuery = supabase.from("financial_records").select("*");
  const roomsQuery = supabase.from("rooms").select("id, type, status");

  if (from) {
    reservationQuery.gte("check_in", `${from}T00:00:00`);
    ordersQuery.gte("created_at", `${from}T00:00:00`);
    financeQuery.gte("record_date", `${from}T00:00:00`);
  }
  if (to) {
    reservationQuery.lte("check_in", `${to}T23:59:59`);
    ordersQuery.lte("created_at", `${to}T23:59:59`);
    financeQuery.lte("record_date", `${to}T23:59:59`);
  }

  const [reservationsRes, ordersRes, inventoryRes, profilesRes, financeRes, roomsRes] = await Promise.all([
    reservationQuery.order("check_in", { ascending: false }),
    ordersQuery.order("created_at", { ascending: false }),
    inventoryQuery.order("name"),
    profilesQuery.order("created_at", { ascending: false }),
    financeQuery.order("record_date", { ascending: false }),
    roomsQuery,
  ]);

  if (reservationsRes.error) throw reservationsRes.error;
  if (ordersRes.error) throw ordersRes.error;
  if (inventoryRes.error) throw inventoryRes.error;
  if (profilesRes.error) throw profilesRes.error;
  if (financeRes.error) throw financeRes.error;
  if (roomsRes.error) throw roomsRes.error;

  const reservations = reservationsRes.data ?? [];
  const orders = ordersRes.data ?? [];
  const inventoryItems = inventoryRes.data ?? [];
  const profiles = profilesRes.data ?? [];
  const financeRecords = financeRes.data ?? [];
  const rooms = roomsRes.data ?? [];

  const totalReservations = reservations.length;
  const confirmedReservations = reservations.filter((r) => r.status === "confirmed" || r.status === "checked_in" || r.status === "checked_out").length;
  const pendingReservations = reservations.filter((r) => r.status === "pending").length;
  const cancelledReservations = reservations.filter((r) => r.status === "cancelled").length;
  const noShowReservations = reservations.filter((r) => {
    if (r.status !== "confirmed") return false;
    const checkIn = new Date(r.check_in).getTime();
    return checkIn < Date.now();
  }).length;

  const hotelRevenue = reservations
    .filter((r) => r.status !== "cancelled")
    .reduce((total, r) => total + Number(r.total_price ?? 0), 0);

  const restaurantRevenue = orders
    .filter((o) => o.status === "paid")
    .reduce((total, o) => total + Number(o.total ?? 0), 0);

  const totalRevenue = hotelRevenue + restaurantRevenue;
  const totalExpenses = financeRecords
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  const totalNights = reservations
    .filter((r) => r.status !== "cancelled")
    .reduce((sum, r) => sum + Number(r.nights ?? 0), 0);
  const averageStay = totalReservations ? totalNights / totalReservations : 0;

  const reservedRooms = rooms.filter((room) => room.status === "occupied").length;
  const occupancyRate = rooms.length ? clampPercentage((reservedRooms / rooms.length) * 100) : 0;

  const roomPerformanceMap = new Map<string, RoomPerformanceRow>();
  for (const reservation of reservations) {
    if (!reservation.rooms) continue;
    const roomId = reservation.rooms.id as string;
    const previous = roomPerformanceMap.get(roomId) ?? {
      roomId,
      roomNumber: reservation.rooms.number,
      roomName: reservation.rooms.name,
      roomType: reservation.rooms.type,
      bookings: 0,
      revenue: 0,
    };
    previous.bookings += 1;
    previous.revenue += Number(reservation.total_price ?? 0);
    roomPerformanceMap.set(roomId, previous);
  }

  const roomPerformance = [...roomPerformanceMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);

  const orderItemRows = orders.flatMap((order) => (order.order_items ?? []).map((item) => ({
    name: item.name,
    quantity: item.quantity,
    revenue: item.line_total,
  })));

  const restaurantProductMap = new Map<string, RestaurantProductRow>();
  for (const item of orderItemRows) {
    const existing = restaurantProductMap.get(item.name) ?? { name: item.name, quantity: 0, revenue: 0 };
    existing.quantity += item.quantity;
    existing.revenue += item.revenue;
    restaurantProductMap.set(item.name, existing);
  }

  const topRestaurantProducts = [...restaurantProductMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const clientCountries = [...groupBy(profiles, (profile) => profile.country ?? "Inconnu").entries()]
    .map(([country, clients]) => ({ country: country || "Inconnu", clients: clients.length }))
    .sort((a, b) => b.clients - a.clients)
    .slice(0, 8);

  const activeClientIds = new Set<string>(reservations.filter((r) => r.profile_id).map((r) => r.profile_id as string));
  const activeClients = profiles.filter((profile) => activeClientIds.has(profile.id)).length;
  const newClients = profiles.filter((profile) => {
    if (!from || !profile.created_at) return false;
    return profile.created_at >= `${from}T00:00:00`;
  }).length;
  const vipClients = profiles.filter((profile) => {
    const profileBookings = reservations.filter((r) => r.profile_id === profile.id && r.status !== "cancelled");
    const totalSpent = profileBookings.reduce((sum, r) => sum + Number(r.total_price ?? 0), 0);
    return totalSpent >= 150_000;
  }).length;

  const financeByCategory = Object.entries(
    groupBy(financeRecords, (record) => record.category ?? "Sans catégorie")
  ).map(([category, records]) => ({
    category,
    amount: records.reduce((sum, record) => sum + Number(record.amount ?? 0), 0),
  })).sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

  const reservationStatusMap = new Map<string, { count: number; revenue: number }>();
  for (const reservation of reservations) {
    const values = reservationStatusMap.get(reservation.status) ?? { count: 0, revenue: 0 };
    values.count += 1;
    values.revenue += Number(reservation.total_price ?? 0);
    reservationStatusMap.set(reservation.status, values);
  }

  const reservationStatus = Array.from(reservationStatusMap.entries()).map(([status, values]) => ({
    status,
    count: values.count,
    revenue: values.revenue,
  }));

  const orderStatusMap = new Map<string, { count: number; total: number }>();
  for (const order of orders) {
    const values = orderStatusMap.get(order.status) ?? { count: 0, total: 0 };
    values.count += 1;
    values.total += Number(order.total ?? 0);
    orderStatusMap.set(order.status, values);
  }

  const orderStatusCounts = Array.from(orderStatusMap.entries()).map(([status, values]) => ({
    status,
    count: values.count,
    total: values.total,
  }));

  const revenueTrend = [];
  if (from && to) {
    const start = new Date(from);
    const end = new Date(to);
    const months: string[] = [];
    const pointer = new Date(start);
    pointer.setDate(1);
    while (pointer <= end) {
      months.push(monthLabel(pointer));
      pointer.setMonth(pointer.getMonth() + 1);
    }
    for (const month of months) {
      const yearMonth = `${new Date(month + " 1").getFullYear()}-${String(new Date(month + " 1").getMonth() + 1).padStart(2, "0")}`;
      const hotel = reservations
        .filter((r) => r.check_in.startsWith(yearMonth) && r.status !== "cancelled")
        .reduce((sum, r) => sum + Number(r.total_price ?? 0), 0);
      const restaurant = orders
        .filter((order) => order.created_at.startsWith(yearMonth) && order.status === "paid")
        .reduce((sum, order) => sum + Number(order.total ?? 0), 0);
      revenueTrend.push({ label: month, hotel, restaurant, net: hotel + restaurant - totalExpenses / months.length });
    }
  }

  const averageOrderValue = orders.length ? orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0) / orders.length : 0;

  return {
    totals: {
      totalRevenue,
      hotelRevenue,
      restaurantRevenue,
      totalReservations,
      averageStay,
      occupancyRate,
      totalClients: profiles.length,
      activeClients,
      newClients,
      vipClients,
      totalExpenses,
      netProfit,
      averageOrderValue,
    },
    reservationStatus,
    revenueTrend: revenueTrend.length ? revenueTrend : [{ label: "Aucune donnée", hotel: 0, restaurant: 0, net: 0 }],
    roomPerformance,
    topRestaurantProducts,
    lowStockItems: inventoryItems
      .map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        min_threshold: item.min_threshold,
        unit_cost: item.unit_cost,
        value: Number(item.quantity) * Number(item.unit_cost ?? 0),
      }))
      .filter((item) => item.quantity <= item.min_threshold)
      .sort((a, b) => b.value - a.value),
    clientCountries,
    financeByCategory,
    orderStatusCounts,
    dateRange: { from: from ?? "", to: to ?? "" },
  };
}
