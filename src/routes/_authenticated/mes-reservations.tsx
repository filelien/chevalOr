import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { formatXOF } from "@/lib/rooms";
import { Button } from "@/components/ui/button";
import { cancelReservation, STATUS_BADGE, STATUS_LABEL, type ReservationStatus } from "@/lib/reservations";
import { generateInvoicePDF } from "@/lib/invoice";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Download, Receipt, XCircle, User, Save, CheckCircle2, Circle } from "lucide-react";

const TIMELINE_STEPS: { key: ReservationStatus | "done"; label: string }[] = [
  { key: "pending", label: "Demande envoyée" },
  { key: "confirmed", label: "Confirmée" },
  { key: "checked_in", label: "Arrivée" },
  { key: "checked_out", label: "Départ" },
];

function StayTimeline({ status }: { status: ReservationStatus }) {
  if (status === "cancelled") {
    return <p className="mt-4 text-sm text-destructive">Réservation annulée</p>;
  }
  const order = ["pending", "confirmed", "checked_in", "checked_out"];
  const idx = order.indexOf(status);
  return (
    <ol className="mt-4 flex flex-wrap gap-2 sm:gap-0 sm:justify-between">
      {TIMELINE_STEPS.map((step, i) => {
        const done = i <= idx;
        const active = i === idx;
        return (
          <li key={step.key} className="flex items-center gap-2 sm:flex-1 sm:flex-col sm:text-center">
            {done ? (
              <CheckCircle2 className={`size-5 shrink-0 ${active ? "text-gold-deep" : "text-emerald-600"}`} />
            ) : (
              <Circle className="size-5 shrink-0 text-muted-foreground/40" />
            )}
            <span className={`text-xs ${done ? "font-medium" : "text-muted-foreground"}`}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export const Route = createFileRoute("/_authenticated/mes-reservations")({
  component: MyReservations,
});

function MyReservations() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "", address: "", city: "", country: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["my-reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*, rooms(name, number, price_per_night)")
        .order("check_in", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
        city: profile.city ?? "",
        country: profile.country ?? "",
      });
    }
  }, [profile]);

  async function handleCancel(id: string, ref: string) {
    if (!confirm(`Annuler la réservation ${ref} ?`)) return;
    try {
      await cancelReservation(id, "Annulée par le client");
      toast.success("Réservation annulée");
      qc.invalidateQueries({ queryKey: ["my-reservations"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profileForm.full_name || null,
      phone: profileForm.phone || null,
      address: profileForm.address || null,
      city: profileForm.city || null,
      country: profileForm.country || null,
    }).eq("id", user.id);
    setSavingProfile(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profil mis à jour");
    setEditing(false);
    qc.invalidateQueries({ queryKey: ["my-profile", user.id] });
  }

  function downloadPDF(r: {
    reference: string;
    check_in: string;
    check_out: string;
    nights: number;
    guests_count: number;
    total_price: number;
    payment_method: string | null;
    paid_at: string | null;
    rooms?: { name?: string; number?: string; price_per_night?: number } | null;
  }, type: "invoice" | "receipt") {
    generateInvoicePDF({
      reference: r.reference,
      type,
      client: {
        name: profile?.full_name || user?.email || "Client",
        email: profile?.email || user?.email,
        phone: profile?.phone,
        address: profile?.address,
      },
      room: { name: r.rooms?.name ?? "Chambre", number: r.rooms?.number ?? "" },
      check_in: r.check_in,
      check_out: r.check_out,
      nights: r.nights,
      guests_count: r.guests_count,
      price_per_night: Number(r.rooms?.price_per_night ?? r.total_price / Math.max(1, r.nights)),
      total: Number(r.total_price),
      payment_method: r.payment_method,
      paid_at: r.paid_at,
    });
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="font-display text-4xl">Mon espace client</h1>
        <p className="mt-2 text-muted-foreground">Suivez votre séjour, téléchargez vos documents et gérez votre profil.</p>

        <div className="mt-10 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-xl"><User className="size-5 text-gold-deep" /> Mon profil</h2>
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Modifier</Button>
            )}
          </div>
          {editing ? (
            <form onSubmit={saveProfile} className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground sm:col-span-2">
                Nom complet
                <input value={profileForm.full_name} onChange={(e) => setProfileForm((f) => ({ ...f, full_name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-input px-3 py-2 text-sm" />
              </label>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                Téléphone
                <input value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-input px-3 py-2 text-sm" />
              </label>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                Email
                <input value={profile?.email ?? user?.email ?? ""} disabled
                  className="mt-1 block w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm" />
              </label>
              <label className="text-xs uppercase tracking-wider text-muted-foreground sm:col-span-2">
                Adresse
                <input value={profileForm.address} onChange={(e) => setProfileForm((f) => ({ ...f, address: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-input px-3 py-2 text-sm" />
              </label>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                Ville
                <input value={profileForm.city} onChange={(e) => setProfileForm((f) => ({ ...f, city: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-input px-3 py-2 text-sm" />
              </label>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                Pays
                <input value={profileForm.country} onChange={(e) => setProfileForm((f) => ({ ...f, country: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-input px-3 py-2 text-sm" />
              </label>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" size="sm" disabled={savingProfile}><Save className="mr-1 size-4" />{savingProfile ? "Enregistrement…" : "Enregistrer"}</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>Annuler</Button>
              </div>
            </form>
          ) : (
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div><dt className="text-muted-foreground">Nom</dt><dd>{profile?.full_name || "—"}</dd></div>
              <div><dt className="text-muted-foreground">Email</dt><dd>{profile?.email ?? user?.email}</dd></div>
              <div><dt className="text-muted-foreground">Téléphone</dt><dd>{profile?.phone || "—"}</dd></div>
              <div><dt className="text-muted-foreground">Adresse</dt><dd>{profile?.address ? `${profile.address}${profile.city ? `, ${profile.city}` : ""}` : "—"}</dd></div>
            </dl>
          )}
        </div>

        <h2 className="mt-12 font-display text-2xl">Mes réservations</h2>
        <div className="mt-6 space-y-4">
          {isLoading ? (
            <p className="text-muted-foreground">Chargement…</p>
          ) : (data?.length ?? 0) === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">Aucune réservation pour le moment.</p>
              <Button variant="hero" className="mt-4" asChild><Link to="/chambres">Réserver une chambre</Link></Button>
            </div>
          ) : data!.map((r) => {
            const status = r.status as ReservationStatus;
            const canCancel = status === "pending" || status === "confirmed";
            return (
              <div key={r.id} className="rounded-xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Réf. {r.reference}</p>
                    <p className="mt-1 font-display text-xl">{r.rooms?.name ?? "Chambre"}</p>
                    <p className="text-sm text-muted-foreground">
                      Du {r.check_in} au {r.check_out} · {r.nights} nuit(s) · {r.guests_count} pers.
                    </p>
                    {r.promo_code && (
                      <p className="mt-1 text-xs text-emerald-600">Code {r.promo_code}{r.discount_percent ? ` (-${r.discount_percent}%)` : ""}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-3 py-1 text-xs ${STATUS_BADGE[status] ?? "bg-secondary"}`}>
                      {STATUS_LABEL[status] ?? status}
                    </span>
                    <p className="mt-2 font-display text-lg text-gold-deep">{formatXOF(Number(r.total_price))}</p>
                  </div>
                </div>
                <StayTimeline status={status} />
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
                  <Button size="sm" variant="outline" onClick={() => downloadPDF(r, "invoice")}>
                    <Download className="mr-1 size-4" /> Facture PDF
                  </Button>
                  {r.paid_at && (
                    <Button size="sm" variant="outline" onClick={() => downloadPDF(r, "receipt")}>
                      <Receipt className="mr-1 size-4" /> Reçu PDF
                    </Button>
                  )}
                  {canCancel && (
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleCancel(r.id, r.reference)}>
                      <XCircle className="mr-1 size-4" /> Annuler
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}
