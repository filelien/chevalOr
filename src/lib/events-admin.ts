import { supabase } from "@/integrations/supabase/client";
import type { BookingStatus } from "@/lib/conference";

export type EventBooking = {
  id: string;
  event_type: string;
  title: string;
  organizer_name: string;
  organizer_email: string | null;
  organizer_phone: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  expected_guests: number;
  price: number | null;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
};

export const EVENT_TYPES: Record<string, string> = {
  seminar: "Séminaire",
  conference: "Conférence",
  wedding: "Mariage",
  reception: "Réception",
  other: "Autre",
};

export async function fetchEventBookings() {
  const { data, error } = await supabase
    .from("event_bookings")
    .select("*")
    .order("event_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as EventBooking[];
}

export async function saveEventBooking(input: Omit<EventBooking, "id" | "created_at"> & { id?: string }) {
  const row = {
    event_type: input.event_type,
    title: input.title,
    organizer_name: input.organizer_name,
    organizer_email: input.organizer_email,
    organizer_phone: input.organizer_phone,
    event_date: input.event_date,
    start_time: input.start_time,
    end_time: input.end_time,
    expected_guests: input.expected_guests,
    price: input.price,
    status: input.status,
    notes: input.notes,
  };
  if (input.id) {
    const { error } = await supabase.from("event_bookings").update(row).eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("event_bookings").insert(row);
    if (error) throw error;
  }
}

export async function setEventStatus(id: string, status: BookingStatus) {
  const { error } = await supabase.from("event_bookings").update({ status }).eq("id", id);
  if (error) throw error;
}
