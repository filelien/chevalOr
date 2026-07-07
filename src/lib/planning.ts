import { supabase } from "@/integrations/supabase/client";
import type { ReservationStatus } from "@/lib/reservations";

export type PlanningReservation = {
  id: string;
  reference: string;
  room_id: string;
  check_in: string;
  check_out: string;
  status: ReservationStatus;
  guests_count: number;
  total_price: number;
  profiles: { full_name: string | null; email: string | null } | null;
};

export type PlanningRoom = {
  id: string;
  number: string;
  name: string;
  status: string;
};

const ACTIVE: ReservationStatus[] = ["pending", "confirmed", "checked_in"];

export async function fetchPlanningData(from: string, to: string) {
  const [{ data: rooms, error: re }, { data: reservations, error: rs }] = await Promise.all([
    supabase.from("rooms").select("id, number, name, status").eq("is_active", true).order("number"),
    supabase
      .from("reservations")
      .select("id, reference, room_id, check_in, check_out, status, guests_count, total_price, profiles(full_name, email)")
      .in("status", ACTIVE)
      .lt("check_in", to)
      .gt("check_out", from)
      .order("check_in"),
  ]);
  if (re) throw re;
  if (rs) throw rs;
  return { rooms: (rooms ?? []) as PlanningRoom[], reservations: (reservations ?? []) as PlanningReservation[] };
}

export function reservationCoversDay(res: PlanningReservation, day: string) {
  return res.check_in <= day && res.check_out > day;
}

export function formatDayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function eachDay(from: Date, to: Date) {
  const days: Date[] = [];
  const cur = new Date(from);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export const PLANNING_STATUS_COLOR: Record<ReservationStatus, string> = {
  pending: "bg-amber-400/90 text-amber-950",
  confirmed: "bg-emerald-500/90 text-white",
  checked_in: "bg-sky-500/90 text-white",
  checked_out: "bg-slate-400 text-white",
  cancelled: "bg-rose-300 text-rose-950",
};
