import { supabase } from "@/integrations/supabase/client";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type ConferenceBooking = {
  id: string;
  organizer_name: string;
  organizer_email: string | null;
  organizer_phone: string | null;
  event_title: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  participants: number;
  equipment: string[];
  price: number | null;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
};

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};

export async function fetchConferenceBookings() {
  const { data, error } = await supabase
    .from("conference_bookings")
    .select("*")
    .order("booking_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ConferenceBooking[];
}

export async function saveConferenceBooking(
  input: Omit<ConferenceBooking, "id" | "created_at"> & { id?: string },
) {
  const row = {
    organizer_name: input.organizer_name,
    organizer_email: input.organizer_email,
    organizer_phone: input.organizer_phone,
    event_title: input.event_title,
    booking_date: input.booking_date,
    start_time: input.start_time,
    end_time: input.end_time,
    participants: input.participants,
    equipment: input.equipment,
    price: input.price,
    status: input.status,
    notes: input.notes,
  };
  if (input.id) {
    const { error } = await supabase.from("conference_bookings").update(row).eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("conference_bookings").insert(row);
    if (error) throw error;
  }
}

export async function setConferenceStatus(id: string, status: BookingStatus) {
  const { error } = await supabase.from("conference_bookings").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteConferenceBooking(id: string) {
  const { error } = await supabase.from("conference_bookings").delete().eq("id", id);
  if (error) throw error;
}
