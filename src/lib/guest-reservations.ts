/**
 * Guest Reservation System — réservation sans compte
 * Utilise la RPC Supabase create_guest_reservation (SECURITY DEFINER)
 */

import { supabase } from "@/integrations/supabase/client";

export type GuestReservationInput = {
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  check_in: string;
  check_out: string;
  room_id: string;
  guests_count: number;
  special_requests?: string;
  payment_method?: string;
  agreed_terms: boolean;
  marketing_consent?: boolean;
};

export type GuestReservation = {
  reservation_id: string;
  guest_email: string;
  booking_reference: string;
  entity_code?: string;
  status: "pending" | "confirmed" | "cancelled";
  check_in: string;
  check_out: string;
  room_name: string;
  total_price: number;
  created_at: string;
  confirmation_sent: boolean;
};

export function validateGuestInput(input: GuestReservationInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!input.full_name || input.full_name.trim().length < 2) errors.push("Nom complet requis (min 2 caractères)");
  if (!input.email || !/^[^@]+@[^@]+\.[^@]+$/.test(input.email)) errors.push("Email invalide");
  if (!input.phone?.trim()) errors.push("Numéro de téléphone requis");
  if (!input.check_in || !input.check_out) errors.push("Dates requises");
  if (new Date(input.check_in) >= new Date(input.check_out)) errors.push("Le départ doit être après l'arrivée");
  if (!input.room_id) errors.push("Chambre requise");
  if (!input.agreed_terms) errors.push("Vous devez accepter les conditions");
  return { valid: errors.length === 0, errors };
}

export async function createGuestReservation(input: GuestReservationInput): Promise<{
  success: boolean;
  reservation_id?: string;
  booking_reference?: string;
  entity_code?: string;
  total_price?: number;
  nights?: number;
  room_name?: string;
  error?: string;
}> {
  try {
    const validation = validateGuestInput(input);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(" · ") };
    }

    const { data, error } = await supabase.rpc("create_guest_reservation", {
      p_full_name: input.full_name.trim(),
      p_email: input.email.trim().toLowerCase(),
      p_check_in: input.check_in,
      p_check_out: input.check_out,
      p_room_id: input.room_id,
      p_phone: input.phone?.trim() || null,
      p_guests_count: input.guests_count,
      p_special_requests: input.special_requests || null,
      p_address: input.address || null,
      p_city: input.city || null,
      p_country: input.country || null,
    });

    if (error) throw error;

    const result = data as {
      success: boolean;
      reservation_id: string;
      reference: string;
      entity_code?: string;
      total_price: number;
      nights: number;
      room_name: string;
    };

    if (!result?.success) {
      return { success: false, error: "Échec de la réservation" };
    }

    try {
      await sendGuestConfirmationEmail({
        guest_name: input.full_name,
        guest_email: input.email,
        booking_reference: result.reference,
        check_in: input.check_in,
        check_out: input.check_out,
        room_name: result.room_name,
        nights: result.nights,
        total_price: result.total_price,
      });
    } catch (emailError) {
      console.warn("[guest-reservations] Email non envoyé:", emailError);
    }

    return {
      success: true,
      reservation_id: result.reservation_id,
      booking_reference: result.reference,
      entity_code: result.entity_code,
      total_price: result.total_price,
      nights: result.nights,
      room_name: result.room_name,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur lors de la réservation";
    console.error("[guest-reservations]", err);
    return { success: false, error: msg };
  }
}

export async function sendGuestConfirmationEmail(data: {
  guest_name: string;
  guest_email: string;
  booking_reference: string;
  check_in: string;
  check_out: string;
  room_name: string;
  nights: number;
  total_price: number;
}): Promise<void> {
  const { sendReservationConfirmation } = await import("./email.server");
  const checkInDate = new Date(data.check_in).toLocaleDateString("fr-FR");
  const checkOutDate = new Date(data.check_out).toLocaleDateString("fr-FR");
  await sendReservationConfirmation({
    fullName: data.guest_name,
    email: data.guest_email,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    nights: data.nights,
    room: data.room_name,
    price: data.total_price,
    reference: data.booking_reference,
  });
}

export async function getGuestReservationStatus(bookingReference: string): Promise<GuestReservation | null> {
  try {
    const { data, error } = await supabase.rpc("get_guest_reservation_by_ref", {
      p_reference: bookingReference,
    });
    if (error || !data || Object.keys(data as object).length === 0) return null;

    const r = data as {
      id: string;
      reference: string;
      entity_code?: string;
      status: GuestReservation["status"];
      check_in: string;
      check_out: string;
      total_price: number;
      guest_email: string;
      room_name: string;
      created_at: string;
    };

    return {
      reservation_id: r.id,
      guest_email: r.guest_email,
      booking_reference: r.reference,
      entity_code: r.entity_code,
      status: r.status,
      check_in: r.check_in,
      check_out: r.check_out,
      room_name: r.room_name,
      total_price: r.total_price,
      created_at: r.created_at,
      confirmation_sent: true,
    };
  } catch (err) {
    console.error("[guest-reservations] Erreur fetch status:", err);
    return null;
  }
}

export async function fetchGuestReservationStats() {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [{ count: total }, { count: pending }, { data: confirmed }] = await Promise.all([
      supabase.from("reservations").select("id", { count: "exact", head: true }).eq("source", "guest_portal"),
      supabase.from("reservations").select("id", { count: "exact", head: true }).eq("source", "guest_portal").eq("status", "pending"),
      supabase.from("reservations").select("total_price").eq("source", "guest_portal").eq("status", "confirmed").gte("created_at", monthStart),
    ]);

    const { data: allGuests } = await supabase.from("reservations").select("total_price").eq("source", "guest_portal");
    const totalRevenue = (allGuests ?? []).reduce((s, r) => s + Number(r.total_price ?? 0), 0);
    const totalGuests = total ?? 0;

    return {
      total_guest_reservations: totalGuests,
      pending_confirmations: pending ?? 0,
      confirmed_this_month: confirmed?.length ?? 0,
      total_revenue_from_guests: totalRevenue,
      avg_reservation_value: totalGuests > 0 ? totalRevenue / totalGuests : 0,
    };
  } catch {
    return {
      total_guest_reservations: 0,
      pending_confirmations: 0,
      confirmed_this_month: 0,
      total_revenue_from_guests: 0,
      avg_reservation_value: 0,
    };
  }
}
