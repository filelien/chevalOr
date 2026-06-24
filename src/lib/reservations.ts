import { supabase } from "@/integrations/supabase/client";

export type ReservationStatus =
  | "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";

export const STATUS_LABEL: Record<ReservationStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  checked_in: "Arrivée effectuée",
  checked_out: "Séjour terminé",
  cancelled: "Annulée",
};

export const STATUS_BADGE: Record<ReservationStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  checked_in: "bg-sky-100 text-sky-800",
  checked_out: "bg-slate-200 text-slate-700",
  cancelled: "bg-rose-100 text-rose-800",
};

export async function cancelReservation(id: string, reason?: string) {
  const { error } = await supabase
    .from("reservations")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason ?? null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function confirmReservation(id: string) {
  const { error } = await supabase
    .from("reservations")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function createWalkInReservation(input: {
  room_id: string;
  profile_id: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_price: number;
  status?: ReservationStatus;
  special_requests?: string | null;
  promo_code?: string | null;
  discount_percent?: number | null;
}) {
  const nights = Math.max(
    0,
    Math.round((new Date(input.check_out).getTime() - new Date(input.check_in).getTime()) / 86400000),
  );
  const { data, error } = await supabase
    .from("reservations")
    .insert({
      room_id: input.room_id,
      profile_id: input.profile_id,
      check_in: input.check_in,
      check_out: input.check_out,
      nights,
      guests_count: input.guests_count,
      total_price: input.total_price,
      status: input.status ?? "confirmed",
      special_requests: input.special_requests ?? null,
      promo_code: input.promo_code ?? null,
      discount_percent: input.discount_percent ?? null,
      payment_status: "unpaid",
    })
    .select("id, reference")
    .single();
  if (error) throw error;
  return data;
}

export async function markPaid(id: string, method: string, amount: number) {
  const { error } = await supabase
    .from("reservations")
    .update({
      payment_method: method,
      payment_amount: amount,
      payment_status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function setReservationStatus(id: string, status: ReservationStatus) {
  const patch: {
    status: ReservationStatus;
    confirmed_at?: string;
    cancelled_at?: string;
  } = { status };
  if (status === "confirmed") patch.confirmed_at = new Date().toISOString();
  if (status === "cancelled") patch.cancelled_at = new Date().toISOString();
  const { error } = await supabase.from("reservations").update(patch).eq("id", id);
  if (error) throw error;
}

export async function isRoomAvailable(
  roomId: string, checkIn: string, checkOut: string, excludeId?: string,
) {
  const { data, error } = await supabase.rpc("is_room_available", {
    _room_id: roomId,
    _check_in: checkIn,
    _check_out: checkOut,
    _exclude_id: excludeId,
  });
  if (error) throw error;
  return data as boolean;
}

export async function findAvailableRoom(
  checkIn: string, checkOut: string, capacity: number, type?: string | null,
) {
  const { data, error } = await supabase.rpc("find_available_room", {
    _check_in: checkIn,
    _check_out: checkOut,
    _capacity: capacity,
    _type: type ?? undefined,
  });
  if (error) throw error;
  return (data as string | null) ?? null;
}

export async function updateReservationDates(
  id: string, checkIn: string, checkOut: string,
) {
  const nights = Math.max(
    1,
    Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000),
  );
  // Re-fetch room price
  const { data: res } = await supabase
    .from("reservations").select("room_id, id").eq("id", id).maybeSingle();
  if (!res) throw new Error("Réservation introuvable");
  const { data: room } = await supabase
    .from("rooms").select("price_per_night").eq("id", res.room_id).maybeSingle();
  if (!room) throw new Error("Chambre introuvable");
  const ok = await isRoomAvailable(res.room_id, checkIn, checkOut, id);
  if (!ok) throw new Error("La chambre n'est plus disponible sur ces dates");
  const total = nights * Number(room.price_per_night);
  const { error } = await supabase.from("reservations").update({
    check_in: checkIn, check_out: checkOut, nights, total_price: total,
  }).eq("id", id);
  if (error) throw error;
}