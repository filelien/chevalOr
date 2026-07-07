import { createServerFn } from "@tanstack/react-start";

type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
};

function adminInbox() {
  return process.env.ADMIN_EMAIL ?? process.env.EMAIL_FROM ?? "reservation@chevaldor.tg";
}

function emailLayout(title: string, body: string) {
  return `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#b8860b">Hôtel Le Cheval d'Or · Anié</p>
      <h1 style="font-size:22px;font-weight:normal">${title}</h1>
      ${body}
      <p style="margin-top:32px;font-size:12px;color:#666">L'équipe du Cheval d'Or</p>
    </div>
  `;
}

/** Envoi email via Resend (si RESEND_API_KEY configurée). */
export const sendEmail = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: EmailPayload }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM ?? "reservation@chevaldor.tg";
    if (!apiKey) return { ok: false as const, skipped: true };

    const to = Array.isArray(data.to) ? data.to : [data.to];

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Le Cheval d'Or <${from}>`,
        to,
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
  roomName?: string;
}) {
  const siteUrl = process.env.VITE_SITE_URL ?? "https://cheval-or.vercel.app";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${siteUrl}/mes-reservations?ref=${input.reference}`)}`;
  const roomLine = input.roomName ? `<p>Chambre : <strong>${input.roomName}</strong></p>` : "";
  return sendEmail({
    data: {
      to: input.email,
      subject: `Confirmation de réservation — ${input.reference}`,
      html: emailLayout("Merci pour votre réservation", `
        <p>Référence : <strong style="font-size:18px;color:#b8860b">${input.reference}</strong></p>
        ${roomLine}
        <table style="width:100%;margin:16px 0;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#666">Arrivée</td><td style="padding:8px 0;font-weight:600">${input.checkIn}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Départ</td><td style="padding:8px 0;font-weight:600">${input.checkOut}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Total</td><td style="padding:8px 0;font-weight:600;color:#b8860b">${input.total.toLocaleString("fr-FR")} XOF</td></tr>
        </table>
        <div style="text-align:center;margin:24px 0">
          <img src="${qrUrl}" alt="QR réservation" width="120" height="120" style="border:1px solid #eee;border-radius:8px" />
          <p style="font-size:11px;color:#888;margin-top:8px">Présentez ce QR à la réception</p>
        </div>
        <p style="text-align:center">
          <a href="${siteUrl}/mes-reservations" style="display:inline-block;background:#1a1d24;color:#f5e6b8;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px">
            Mon espace client
          </a>
        </p>
      `),
    },
  });
}

export async function notifyContactMessage(input: {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const html = emailLayout("Nouveau message contact", `
    <p><strong>${input.fullName}</strong> · ${input.email}${input.phone ? ` · ${input.phone}` : ""}</p>
    <p>Sujet : ${input.subject}</p>
    <p style="white-space:pre-wrap">${input.message}</p>
  `);
  await Promise.all([
    sendEmail({
      data: {
        to: adminInbox(),
        subject: `[Contact] ${input.subject} — ${input.fullName}`,
        html,
      },
    }),
    sendEmail({
      data: {
        to: input.email,
        subject: "Nous avons bien reçu votre message — Cheval d'Or",
        html: emailLayout("Message reçu", `
          <p>Bonjour ${input.fullName},</p>
          <p>Nous avons bien reçu votre demande concernant « ${input.subject} ». Notre équipe vous répond sous 24h.</p>
        `),
      },
    }),
  ]);
}

export async function notifyTableReservation(input: {
  reference: string;
  fullName: string;
  email: string;
  date: string;
  time: string;
  guests: number;
}) {
  const details = `
    <p>Référence : <strong>${input.reference}</strong></p>
    <p>${input.date} à ${input.time.slice(0, 5)} · ${input.guests} couverts</p>
  `;
  await Promise.all([
    sendEmail({
      data: {
        to: input.email,
        subject: `Demande de table — ${input.reference}`,
        html: emailLayout("Demande de réservation restaurant", `
          <p>Bonjour ${input.fullName},</p>
          <p>Votre demande de table a été enregistrée. Confirmation sous peu par notre équipe.</p>
          ${details}
        `),
      },
    }),
    sendEmail({
      data: {
        to: adminInbox(),
        subject: `[Restaurant] Table ${input.reference} — ${input.fullName}`,
        html: emailLayout("Nouvelle réservation table", `<p>${input.fullName} · ${input.email}</p>${details}`),
      },
    }),
  ]);
}

export async function notifyConferenceRequest(input: {
  organizerName: string;
  organizerEmail: string;
  eventTitle: string;
  bookingDate: string;
  participants: number;
}) {
  await Promise.all([
    sendEmail({
      data: {
        to: input.organizerEmail,
        subject: `Demande salle de conférence — ${input.eventTitle}`,
        html: emailLayout("Demande enregistrée", `
          <p>Bonjour ${input.organizerName},</p>
          <p>Votre demande pour « ${input.eventTitle} » le ${input.bookingDate} (${input.participants} participants) est en cours d'étude.</p>
        `),
      },
    }),
    sendEmail({
      data: {
        to: adminInbox(),
        subject: `[Conférence] ${input.eventTitle}`,
        html: emailLayout("Nouvelle demande conférence", `
          <p>${input.organizerName} · ${input.organizerEmail}</p>
          <p>${input.eventTitle} — ${input.bookingDate} · ${input.participants} pers.</p>
        `),
      },
    }),
  ]);
}

export async function notifyEventRequest(input: {
  organizerName: string;
  organizerEmail: string;
  title: string;
  eventDate: string;
  eventType: string;
  expectedGuests: number;
}) {
  await Promise.all([
    sendEmail({
      data: {
        to: input.organizerEmail,
        subject: `Demande événement — ${input.title}`,
        html: emailLayout("Demande enregistrée", `
          <p>Bonjour ${input.organizerName},</p>
          <p>Votre demande « ${input.title} » (${input.eventType}) le ${input.eventDate} pour ${input.expectedGuests} invités est en cours d'étude.</p>
        `),
      },
    }),
    sendEmail({
      data: {
        to: adminInbox(),
        subject: `[Événement] ${input.title}`,
        html: emailLayout("Nouvelle demande événement", `
          <p>${input.organizerName} · ${input.organizerEmail}</p>
          <p>${input.title} — ${input.eventDate} · ${input.expectedGuests} invités</p>
        `),
      },
    }),
  ]);
}
