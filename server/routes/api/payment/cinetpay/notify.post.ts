import { defineEventHandler, readBody, setResponseStatus } from "h3";

function parseReservationId(transactionId: string): string | null {
  const match = transactionId.match(
    /^res-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-\d+$/i,
  );
  return match?.[1] ?? null;
}

/** Webhook CinetPay — confirme le paiement d'une réservation. */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const transactionId =
    (body?.cpm_trans_id as string | undefined) ??
    (body?.transaction_id as string | undefined);

  if (!transactionId) {
    setResponseStatus(event, 400);
    return { ok: false, error: "transaction_id manquant" };
  }

  const apiKey = process.env.CINETPAY_API_KEY;
  const siteId = process.env.CINETPAY_SITE_ID;
  if (!apiKey || !siteId) {
    setResponseStatus(event, 503);
    return { ok: false, error: "Paiement non configuré" };
  }

  const checkRes = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: apiKey,
      site_id: siteId,
      transaction_id: transactionId,
    }),
  });

  const checkJson = await checkRes.json();
  const paid =
    checkRes.ok &&
    (checkJson.code === "00" || checkJson.data?.status === "ACCEPTED");

  if (!paid) {
    return { ok: true, ignored: true };
  }

  const reservationId = parseReservationId(transactionId);
  if (!reservationId) {
    setResponseStatus(event, 400);
    return { ok: false, error: "transaction_id invalide" };
  }

  const amount = Number(checkJson.data?.amount ?? body?.cpm_amount ?? 0);

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("reservations")
      .update({
        payment_status: "paid",
        payment_method: "CinetPay",
        payment_amount: amount || null,
        paid_at: new Date().toISOString(),
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", reservationId)
      .in("payment_status", ["unpaid", "pending"]);

    if (error) {
      console.error("[cinetpay notify]", error.message);
      setResponseStatus(event, 500);
      return { ok: false, error: error.message };
    }
  } catch (e) {
    console.error("[cinetpay notify]", e);
    setResponseStatus(event, 500);
    return { ok: false, error: "Erreur serveur" };
  }

  return { ok: true };
});
