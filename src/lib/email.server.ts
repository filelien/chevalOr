import { createServerFn } from "@tanstack/react-start";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

/** Envoi email via Resend (si RESEND_API_KEY configurée). */
export const sendEmail = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: EmailPayload }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM ?? "reservation@chevaldor.tg";
    if (!apiKey) return { ok: false as const, skipped: true };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Le Cheval d'Or <${from}>`,
        to: [data.to],
        subject: data.subject,
        html: data.html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false as const, error: text };
    }
    return { ok: true as const };
  });

export async function notifyReservationConfirmation(input: {
  email: string;
  reference: string;
  checkIn: string;
  checkOut: string;
  total: number;
}) {
  return sendEmail({
    data: {
      to: input.email,
      subject: `Confirmation de réservation — ${input.reference}`,
      html: `
        <h1>Merci pour votre réservation</h1>
        <p>Référence : <strong>${input.reference}</strong></p>
        <p>Arrivée : ${input.checkIn} · Départ : ${input.checkOut}</p>
        <p>Total : ${input.total.toLocaleString("fr-FR")} XOF</p>
        <p>L'équipe du Cheval d'Or vous accueillera à Anié.</p>
      `,
    },
  });
}
