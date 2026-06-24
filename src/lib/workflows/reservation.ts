import { logAudit } from "@/lib/audit";
import { supabase } from "@/integrations/supabase/client";

/** Workflow post-création réservation : audit + notification admin. */
export async function runReservationCreatedWorkflow(input: {
  reservationId: string;
  reference: string;
  profileId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  total: number;
}) {
  void logAudit({
    action: "reservation_created",
    module: "reservation",
    entity_type: "reservation",
    entity_id: input.reservationId,
    details: {
      reference: input.reference,
      check_in: input.checkIn,
      check_out: input.checkOut,
      total: input.total,
      room_id: input.roomId,
      profile_id: input.profileId,
    },
  });

  try {
    await supabase.from("admin_notifications").insert({
      type: "reservation",
      title: `Nouvelle réservation ${input.reference}`,
      body: `Arrivée ${input.checkIn} — ${input.total.toLocaleString("fr-FR")} XOF`,
      link: "/admin/reservations",
      is_read: false,
    });
  } catch {
    /* non bloquant */
  }
}
