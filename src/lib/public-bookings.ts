import { supabase } from "@/integrations/supabase/client";

export type ConferenceRequest = {
  organizer_name: string;
  organizer_email: string;
  organizer_phone: string;
  event_title: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  participants: number;
  equipment: string[];
  notes?: string;
};

export type EventRequest = {
  event_type: string;
  title: string;
  organizer_name: string;
  organizer_email: string;
  organizer_phone: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  expected_guests: number;
  notes?: string;
};

export async function submitConferenceRequest(input: ConferenceRequest) {
  const { error } = await supabase.from("conference_bookings").insert({
    organizer_name: input.organizer_name,
    organizer_email: input.organizer_email,
    organizer_phone: input.organizer_phone,
    event_title: input.event_title,
    booking_date: input.booking_date,
    start_time: input.start_time,
    end_time: input.end_time,
    participants: input.participants,
    equipment: input.equipment,
    notes: input.notes ?? null,
    status: "pending",
    price: null,
  });
  if (error) throw error;
}

export async function submitEventRequest(input: EventRequest) {
  const { error } = await supabase.from("event_bookings").insert({
    event_type: input.event_type,
    title: input.title,
    organizer_name: input.organizer_name,
    organizer_email: input.organizer_email,
    organizer_phone: input.organizer_phone,
    event_date: input.event_date,
    start_time: input.start_time ?? null,
    end_time: input.end_time ?? null,
    expected_guests: input.expected_guests,
    notes: input.notes ?? null,
    status: "pending",
    price: null,
  });
  if (error) throw error;
}

export async function submitPublicReview(input: {
  author_name: string;
  author_email?: string;
  rating: number;
  comment: string;
}) {
  const { error } = await supabase.from("reviews").insert({
    author_name: input.author_name,
    author_email: input.author_email ?? null,
    rating: input.rating,
    comment: input.comment,
    is_published: false,
    admin_reply: null,
  });
  if (error) throw error;
}
