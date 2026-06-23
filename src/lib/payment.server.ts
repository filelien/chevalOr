import { createServerFn } from "@tanstack/react-start";
import { SITE_URL } from "@/lib/cms";

export type PaymentInitInput = {
  reservationId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  description: string;
};

/** Initie un paiement CinetPay (Mobile Money / carte). Requiert CINETPAY_API_KEY et CINETPAY_SITE_ID. */
export const initiateCinetPay = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: PaymentInitInput }) => {
    const apiKey = process.env.CINETPAY_API_KEY;
    const siteId = process.env.CINETPAY_SITE_ID;
    if (!apiKey || !siteId) {
      return { ok: false as const, error: "Paiement en ligne non configuré. Réservation enregistrée — paiement à l'arrivée." };
    }

    const transactionId = `res-${data.reservationId}-${Date.now()}`;
    const notifyUrl = `${SITE_URL}/api/payment/cinetpay/notify`;
    const returnUrl = `${SITE_URL}/mes-reservations?paid=1`;

    const res = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: apiKey },
      body: JSON.stringify({
        apikey: apiKey,
        site_id: siteId,
        transaction_id: transactionId,
        amount: Math.round(data.amount),
        currency: "XOF",
        description: data.description,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        notify_url: notifyUrl,
        return_url: returnUrl,
        channels: "ALL",
      }),
    });

    const json = await res.json();
    if (!res.ok || json.code !== "201") {
      return { ok: false as const, error: json.message ?? "Erreur CinetPay" };
    }

    return {
      ok: true as const,
      paymentUrl: json.data?.payment_url as string,
      transactionId,
    };
  });
