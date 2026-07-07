import { initiateCinetPay } from "@/lib/payment.server";
import { notifyReservationConfirmation } from "@/lib/email.server";
import { runReservationCreatedWorkflow } from "@/lib/workflows/reservation";

export type PostReservationInput = {
  reservationId: string;
  reference: string;
  email: string;
  customerName: string;
  profileId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  total: number;
  roomName?: string;
};

export type PostReservationResult =
  | { kind: "redirect"; paymentUrl: string }
  | { kind: "done"; message: string };

/** Email de confirmation + redirection CinetPay si configuré. */
export async function completeReservationFlow(
  input: PostReservationInput,
): Promise<PostReservationResult> {
  void notifyReservationConfirmation({
    email: input.email,
    reference: input.reference,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    total: input.total,
    roomName: input.roomName,
  });

  void runReservationCreatedWorkflow({
    reservationId: input.reservationId,
    reference: input.reference,
    profileId: input.profileId,
    roomId: input.roomId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    total: input.total,
  });

  const pay = await initiateCinetPay({
    data: {
      reservationId: input.reservationId,
      amount: input.total,
      customerEmail: input.email,
      customerName: input.customerName,
      description: `Réservation ${input.reference}`,
    },
  });

  if (pay.ok && pay.paymentUrl) {
    return { kind: "redirect", paymentUrl: pay.paymentUrl };
  }

  return {
    kind: "done",
    message: pay.ok === false && pay.error
      ? pay.error
      : "Réservation enregistrée ! Paiement à l'arrivée ou à la réception.",
  };
}
