/**
 * Guest Reservation System (Réservation sans Compte)
 * Formulaire public pour réserver sans login
 * Crée automatiquement le profil client après réservation
 */

import { supabase } from "@/integrations/supabase/client";

export type GuestReservationInput = {
  // Guest info
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  nationality?: string;
  gender?: "M" | "F" | "Other";
  date_of_birth?: string;

  // Reservation details
  check_in: string; // ISO date
  check_out: string; // ISO date
  room_id: string;
  guests_count: number;
  special_requests?: string;

  // Payment
  payment_method?: string; // "card" | "transfer" | "cash"
  agreed_terms: boolean;
  marketing_consent?: boolean;
};

export type GuestReservation = {
  reservation_id: string;
  guest_email: string;
  booking_reference: string;
  status: "pending" | "confirmed" | "cancelled";
  check_in: string;
  check_out: string;
  room_name: string;
  total_price: number;
  created_at: string;
  confirmation_sent: boolean;
};

/**
 * Valide input réservation guest
 */
export function validateGuestInput(input: GuestReservationInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input.full_name || input.full_name.length < 2) errors.push("Nom requis (min 2 caractères)");
  if (!input.email || !input.email.includes("@")) errors.push("Email invalide");
  if (!input.check_in || !input.check_out) errors.push("Dates requises");
  if (new Date(input.check_in) >= new Date(input.check_out)) errors.push("Check-out doit être après check-in");
  if (!input.room_id) errors.push("Chambre requise");
  if (!input.agreed_terms) errors.push("Conditions d'utilisation requises");

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Réserve une chambre sans compte - Workflow complet:
 * 1. Valide input
 * 2. Créé profil client automatiquement (email comme identifiant unique)
 * 3. Crée réservation
 * 4. Envoie email confirmation
 * 5. Retourne reference booking
 */
export async function createGuestReservation(input: GuestReservationInput): Promise<{
  success: boolean;
  reservation_id?: string;
  booking_reference?: string;
  error?: string;
}> {
  try {
    // 1. Valider input
    const validation = validateGuestInput(input);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(" | ") };
    }

    // 2. Vérifier si profil client existe (par email)
    let profileId: string;
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", input.email)
      .single();

    if (existingProfile) {
      profileId = existingProfile.id;
      // Mettre à jour profil existant
      await supabase.from("profiles").update({
        full_name: input.full_name,
        phone: input.phone,
        address: input.address,
        city: input.city,
        country: input.country,
        gender: input.gender,
        date_of_birth: input.date_of_birth,
        nationality: input.nationality,
        marketing_consent: input.marketing_consent ?? false,
        preferred_language: "fr",
      }).eq("id", profileId);
    } else {
      // Créer profil client automatiquement
      const { data: newProfile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          email: input.email,
          full_name: input.full_name,
          phone: input.phone,
          address: input.address,
          city: input.city,
          country: input.country,
          gender: input.gender,
          date_of_birth: input.date_of_birth,
          nationality: input.nationality,
          marketing_consent: input.marketing_consent ?? false,
          preferred_language: "fr",
          vip_level: "standard",
          total_spent: 0,
          reservation_count: 0,
        })
        .select("id")
        .single();

      if (profileError) throw profileError;
      profileId = newProfile.id;
    }

    // 3. Récupérer info chambre pour calcul prix
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id, name, price_per_night")
      .eq("id", input.room_id)
      .single();

    if (roomError || !room) throw new Error("Chambre non trouvée");

    // Calculer nombre de nuits
    const checkIn = new Date(input.check_in);
    const checkOut = new Date(input.check_out);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * (room.price_per_night || 0);

    // 4. Créer réservation
    const bookingReference = `RES-${Date.now().toString(36).toUpperCase()}`;

    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .insert({
        profile_id: profileId,
        room_id: input.room_id,
        check_in_date: input.check_in,
        check_out_date: input.check_out,
        guests_count: input.guests_count,
        total_price: totalPrice,
        payment_method: input.payment_method || "pending",
        status: "pending",
        special_requests: input.special_requests,
        booking_reference: bookingReference,
        source: "guest_portal",
      })
      .select("id")
      .single();

    if (reservationError) throw reservationError;

    // 5. Mettre à jour stats client
    await supabase
      .from("profiles")
      .update({
        reservation_count: existingProfile ? (existingProfile.reservation_count || 0) + 1 : 1,
        last_booking_date: new Date().toISOString(),
      })
      .eq("id", profileId);

    // 6. Envoyer email confirmation
    try {
      await sendGuestConfirmationEmail({
        guest_name: input.full_name,
        guest_email: input.email,
        booking_reference: bookingReference,
        check_in: input.check_in,
        check_out: input.check_out,
        room_name: room.name,
        nights,
        total_price: totalPrice,
      });
    } catch (emailError) {
      console.warn("[guest-reservations] Email non envoyé:", emailError);
      // Ne pas échouer si email échoue
    }

    // 7. Log audit
    try {
      const { logAuditEntry } = await import("./global-audit");
      await logAuditEntry({
        user_id: "guest",
        user_email: input.email,
        action: "reservation.create" as any,
        module: "reservations",
        level: "INFO",
        entity_type: "reservation",
        entity_id: reservation.id,
        details: {
          source: "guest_portal",
          room_id: input.room_id,
          nights,
          total_price,
        },
      });
    } catch (auditError) {
      console.warn("[guest-reservations] Audit échoué:", auditError);
    }

    return {
      success: true,
      reservation_id: reservation.id,
      booking_reference: bookingReference,
    };
  } catch (err: any) {
    console.error("[guest-reservations] Erreur création réservation:", err);
    return {
      success: false,
      error: err.message || "Erreur lors de la réservation",
    };
  }
}

/**
 * Envoie email de confirmation au guest
 */
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
  try {
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
  } catch (err) {
    console.error("[guest-reservations] Erreur email:", err);
    throw err;
  }
}

/**
 * Récupère état réservation guest par reference
 */
export async function getGuestReservationStatus(bookingReference: string): Promise<GuestReservation | null> {
  try {
    const { data, error } = await supabase
      .from("reservations")
      .select(
        `
        id, 
        check_in_date, 
        check_out_date, 
        total_price, 
        status, 
        created_at, 
        booking_reference,
        profiles:profile_id (email),
        rooms:room_id (name)
      `
      )
      .eq("booking_reference", bookingReference)
      .single();

    if (error || !data) return null;

    return {
      reservation_id: data.id,
      guest_email: (data.profiles as any)?.email,
      booking_reference: data.booking_reference,
      status: data.status,
      check_in: data.check_in_date,
      check_out: data.check_out_date,
      room_name: (data.rooms as any)?.name,
      total_price: data.total_price,
      created_at: data.created_at,
      confirmation_sent: true,
    };
  } catch (err) {
    console.error("[guest-reservations] Erreur fetch status:", err);
    return null;
  }
}

/**
 * Permet au guest de modifier sa réservation pending (avant confirmation)
 */
export async function updateGuestReservation(
  bookingReference: string,
  updates: Partial<GuestReservationInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: reservation } = await supabase
      .from("reservations")
      .select("id, status")
      .eq("booking_reference", bookingReference)
      .single();

    if (!reservation) return { success: false, error: "Réservation non trouvée" };

    if (reservation.status !== "pending") {
      return { success: false, error: "Réservation confirmée - modification impossible" };
    }

    // Mettre à jour réservation
    const { error } = await supabase
      .from("reservations")
      .update({
        check_in_date: updates.check_in,
        check_out_date: updates.check_out,
        special_requests: updates.special_requests,
      })
      .eq("id", reservation.id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("[guest-reservations] Erreur update:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Annule réservation guest
 */
export async function cancelGuestReservation(
  bookingReference: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: reservation } = await supabase
      .from("reservations")
      .select("id, status")
      .eq("booking_reference", bookingReference)
      .single();

    if (!reservation) return { success: false, error: "Réservation non trouvée" };

    const { error } = await supabase
      .from("reservations")
      .update({
        status: "cancelled",
        special_requests: `Annulation: ${reason || "Sans raison"}`,
      })
      .eq("id", reservation.id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("[guest-reservations] Erreur annulation:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Génère statistiques réservations guests (pour dashboard)
 */
export async function fetchGuestReservationStats(): Promise<{
  total_guest_reservations: number;
  pending_confirmations: number;
  confirmed_this_month: number;
  total_revenue_from_guests: number;
  avg_reservation_value: number;
}> {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [{ data: allGuests }, { data: pending }, { data: confirmed }] = await Promise.all([
      supabase.from("reservations").select("id, total_price", { count: "exact" }).eq("source", "guest_portal"),
      supabase
        .from("reservations")
        .select("id", { count: "exact" })
        .eq("source", "guest_portal")
        .eq("status", "pending"),
      supabase
        .from("reservations")
        .select("id, total_price")
        .eq("source", "guest_portal")
        .eq("status", "confirmed")
        .gte("created_at", monthStart),
    ]);

    const totalGuests = allGuests?.length ?? 0;
    const totalRevenue = (allGuests ?? []).reduce((sum: number, r: any) => sum + (r.total_price || 0), 0);
    const confirmedThisMonth = confirmed?.length ?? 0;

    return {
      total_guest_reservations: totalGuests,
      pending_confirmations: pending?.length ?? 0,
      confirmed_this_month: confirmedThisMonth,
      total_revenue_from_guests: totalRevenue,
      avg_reservation_value: totalGuests > 0 ? totalRevenue / totalGuests : 0,
    };
  } catch (err) {
    console.error("[guest-reservations] Erreur stats:", err);
    return {
      total_guest_reservations: 0,
      pending_confirmations: 0,
      confirmed_this_month: 0,
      total_revenue_from_guests: 0,
      avg_reservation_value: 0,
    };
  }
}
