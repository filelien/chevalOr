import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { getSiteSetting, setSiteSetting } from "@/lib/site-settings";
import { HOTEL } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/parametres")({
  component: AdminParametres,
});

type HotelSettings = {
  checkIn: string;
  checkOut: string;
  restaurant: string;
  cancellationPolicy: string;
};

type PaymentSettings = {
  cinetpay: boolean;
  paydunya: boolean;
  flooz: boolean;
  tmoney: boolean;
  cash: boolean;
};

function AdminParametres() {
  const qc = useQueryClient();
  const { data: hotelSettings } = useQuery({
    queryKey: ["hotel-settings"],
    queryFn: () =>
      getSiteSetting<HotelSettings>("hotel_settings", {
        checkIn: HOTEL.hours.checkIn,
        checkOut: HOTEL.hours.checkOut,
        restaurant: HOTEL.hours.restaurant,
        cancellationPolicy: "Annulation gratuite jusqu'à 48h avant l'arrivée.",
      }),
  });
  const { data: paymentSettings } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: () =>
      getSiteSetting<PaymentSettings>("payment_settings", {
        cinetpay: true,
        paydunya: false,
        flooz: true,
        tmoney: true,
        cash: true,
      }),
  });

  const [hours, setHours] = useState<HotelSettings>({
    checkIn: HOTEL.hours.checkIn,
    checkOut: HOTEL.hours.checkOut,
    restaurant: HOTEL.hours.restaurant,
    cancellationPolicy: "",
  });
  const [payments, setPayments] = useState<PaymentSettings>({
    cinetpay: true,
    paydunya: false,
    flooz: true,
    tmoney: true,
    cash: true,
  });

  useEffect(() => {
    if (hotelSettings) setHours(hotelSettings);
  }, [hotelSettings]);
  useEffect(() => {
    if (paymentSettings) setPayments(paymentSettings);
  }, [paymentSettings]);

  async function saveHours() {
    await setSiteSetting("hotel_settings", hours);
    toast.success("Horaires enregistrés");
    qc.invalidateQueries({ queryKey: ["hotel-settings"] });
  }

  async function savePayments() {
    await setSiteSetting("payment_settings", payments);
    toast.success("Moyens de paiement enregistrés");
    qc.invalidateQueries({ queryKey: ["payment-settings"] });
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Configuration"
        title="Paramètres de l'établissement"
        subtitle="Horaires, paiements et politiques — sans accéder à Supabase ni au code."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">Réservations & horaires</h2>
          <div className="mt-4 space-y-3">
            {(["checkIn", "checkOut", "restaurant"] as const).map((k) => (
              <label key={k} className="block text-sm">
                <span className="text-muted-foreground capitalize">{k}</span>
                <input className="mt-1 w-full rounded-md border px-3 py-2" value={hours[k]} onChange={(e) => setHours((h) => ({ ...h, [k]: e.target.value }))} />
              </label>
            ))}
            <label className="block text-sm">
              <span className="text-muted-foreground">Politique d'annulation</span>
              <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={3} value={hours.cancellationPolicy} onChange={(e) => setHours((h) => ({ ...h, cancellationPolicy: e.target.value }))} />
            </label>
          </div>
          <Button className="mt-4" variant="hero" onClick={saveHours}>Enregistrer</Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">Moyens de paiement acceptés</h2>
          <div className="mt-4 space-y-2">
            {(Object.keys(payments) as (keyof PaymentSettings)[]).map((k) => (
              <label key={k} className="flex items-center gap-2 text-sm capitalize">
                <input type="checkbox" checked={payments[k]} onChange={(e) => setPayments((p) => ({ ...p, [k]: e.target.checked }))} />
                {k}
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">CinetPay : configurez CINETPAY_API_KEY et CINETPAY_SITE_ID sur Vercel.</p>
          <Button className="mt-4" variant="hero" onClick={savePayments}>Enregistrer</Button>
        </div>
      </div>
    </div>
  );
}
