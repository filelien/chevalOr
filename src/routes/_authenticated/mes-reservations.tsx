import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { SiteShell } from "@/components/layout/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { formatXOF } from "@/lib/rooms";
import { Button } from "@/components/ui/button";
import { cancelReservation, STATUS_BADGE, STATUS_LABEL, type ReservationStatus } from "@/lib/reservations";
import { generateInvoicePDF } from "@/lib/invoice";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Download, Receipt, XCircle, User, Save, CheckCircle2, Circle,
  CalendarDays, BedDouble, Wallet, Sparkles,
} from "lucide-react";

const TIMELINE_STEPS: { key: string; label: string }[] = [
  { key: "pending", label: "Demande" },
  { key: "confirmed", label: "Confirmée" },
  { key: "checked_in", label: "Arrivée" },
  { key: "checked_out", label: "Départ" },
];

function StayTimeline({ status }: { status: ReservationStatus }) {
  if (status === "cancelled") {
    return (
      <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
        Cette réservation a été annulée.
      </div>
    );
  }
  const order = ["pending", "confirmed", "checked_in", "checked_out"];
  const idx = order.indexOf(status);
  return (
    <div className="relative mt-6">
      <div className="client-timeline-line hidden sm:block" />
      <ol className="relative z-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TIMELINE_STEPS.map((step, i) => {
          const done = i <= idx;
          const active = i === idx;
          return (
            <li key={step.key} className="flex flex-col items-center text-center">
              {done ? (
                <CheckCircle2 className={`size-6 ${active ? "text-gold-deep" : "text-emerald-600"}`} />
              ) : (
                <Circle className="size-6 text-muted-foreground/30" />
              )}
              <span className={`mt-2 text-xs font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
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

  const stats = useMemo(() => {
    const list = data ?? [];
    const active = list.filter((r) => r.status !== "cancelled" && r.status !== "checked_out");
    const totalSpent = list
      .filter((r) => r.status !== "cancelled")
      .reduce((s, r) => s + Number(r.total_price ?? 0), 0);
    return { count: list.length, active: active.length, totalSpent };
  }, [data]);

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

  const displayName = profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Client";
  const initials = (profile?.full_name ?? user?.email ?? "C").slice(0, 2).toUpperCase();

  return (
    <SiteShell>
      {/* Bandeau d'accueil */}
      <div className="client-hero-band px-6 py-12 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-gold/20 text-xl font-semibold text-gold ring-2 ring-gold/30">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-gold/90">Espace client</p>
              <h1 className="font-display text-3xl font-medium md:text-4xl">Bienvenue, {displayName}</h1>
              <p className="mt-1 text-sm text-white/75">Gérez vos séjours, documents et préférences en toute simplicité.</p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <CalendarDays className="size-5 text-gold" />
              <p className="mt-2 text-2xl font-display font-medium">{stats.active}</p>
              <p className="text-xs text-white/60">Séjour{stats.active > 1 ? "s" : ""} actif{stats.active > 1 ? "s" : ""}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <BedDouble className="size-5 text-gold" />
              <p className="mt-2 text-2xl font-display font-medium">{stats.count}</p>
              <p className="text-xs text-white/60">Réservation{stats.count > 1 ? "s" : ""} au total</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <Wallet className="size-5 text-gold" />
              <p className="mt-2 text-2xl font-display font-medium">{formatXOF(stats.totalSpent)}</p>
              <p className="text-xs text-white/60">Total dépensé</p>
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-6 py-12">
        {/* Profil */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 font-display text-xl">
              <User className="size-5 text-gold-deep" /> Mon profil
            </h2>
            {!editing && (
              <Button variant="goldOutline" size="sm" onClick={() => setEditing(true)}>Modifier</Button>
            )}
          </div>
          {editing ? (
            <form onSubmit={saveProfile} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-foreground sm:col-span-2">
                Nom complet
                <input value={profileForm.full_name} onChange={(e) => setProfileForm((f) => ({ ...f, full_name: e.target.value }))}
                  className="mt-1.5 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
              </label>
              <label className="text-sm font-medium text-foreground">
                Téléphone
                <input value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                  className="mt-1.5 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
              </label>
              <label className="text-sm font-medium text-foreground">
                Email
                <input value={profile?.email ?? user?.email ?? ""} disabled
                  className="mt-1.5 block w-full rounded-lg border border-input bg-secondary/40 px-4 py-2.5 text-sm text-muted-foreground" />
              </label>
              <label className="text-sm font-medium text-foreground sm:col-span-2">
                Adresse
                <input value={profileForm.address} onChange={(e) => setProfileForm((f) => ({ ...f, address: e.target.value }))}
                  className="mt-1.5 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
              </label>
              <label className="text-sm font-medium text-foreground">
                Ville
                <input value={profileForm.city} onChange={(e) => setProfileForm((f) => ({ ...f, city: e.target.value }))}
                  className="mt-1.5 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
              </label>
              <label className="text-sm font-medium text-foreground">
                Pays
                <input value={profileForm.country} onChange={(e) => setProfileForm((f) => ({ ...f, country: e.target.value }))}
                  className="mt-1.5 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm" />
              </label>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" variant="hero" size="sm" disabled={savingProfile}>
                  <Save className="mr-1 size-4" />{savingProfile ? "Enregistrement…" : "Enregistrer"}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>Annuler</Button>
              </div>
            </form>
          ) : (
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-secondary/40 px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nom</dt>
                <dd className="mt-1 font-medium">{profile?.full_name || "—"}</dd>
              </div>
              <div className="rounded-lg bg-secondary/40 px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</dt>
                <dd className="mt-1 font-medium">{profile?.email ?? user?.email}</dd>
              </div>
              <div className="rounded-lg bg-secondary/40 px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Téléphone</dt>
                <dd className="mt-1 font-medium">{profile?.phone || "—"}</dd>
              </div>
              <div className="rounded-lg bg-secondary/40 px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Adresse</dt>
                <dd className="mt-1 font-medium">{profile?.address ? `${profile.address}${profile.city ? `, ${profile.city}` : ""}` : "—"}</dd>
              </div>
            </dl>
          )}
        </div>

        {/* Réservations */}
        <div className="mt-12 flex items-center justify-between">
          <h2 className="font-display text-2xl">Mes réservations</h2>
          <Button variant="hero" size="sm" asChild>
            <Link to="/reserver"><Sparkles className="mr-1 size-4" />Nouvelle réservation</Link>
          </Button>
        </div>

        <div className="mt-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-secondary/50" />)}
            </div>
          ) : (data?.length ?? 0) === 0 ? (
            <div className="rounded-2xl border border-dashed border-gold/30 bg-gold-soft/20 p-12 text-center">
              <BedDouble className="mx-auto size-12 text-gold-deep/60" />
              <p className="mt-4 font-display text-xl">Aucune réservation</p>
              <p className="mt-2 text-sm text-muted-foreground">Découvrez nos chambres et réservez votre prochain séjour à Anié.</p>
              <Button variant="hero" className="mt-6" asChild>
                <Link to="/chambres">Explorer les chambres</Link>
              </Button>
            </div>
          ) : data!.map((r) => {
            const status = r.status as ReservationStatus;
            const canCancel = status === "pending" || status === "confirmed";
            const checkIn = format(new Date(r.check_in), "d MMMM yyyy", { locale: fr });
            const checkOut = format(new Date(r.check_out), "d MMMM yyyy", { locale: fr });
            return (
              <article key={r.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
                <div className="border-b border-border/60 bg-gradient-to-r from-gold-soft/30 to-transparent px-6 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gold-deep">Réf. {r.reference}</p>
                      <h3 className="mt-1 font-display text-2xl">{r.rooms?.name ?? "Chambre"}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Chambre {r.rooms?.number} · {r.nights} nuit{r.nights > 1 ? "s" : ""} · {r.guests_count} personne{r.guests_count > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[status] ?? "bg-secondary"}`}>
                        {STATUS_LABEL[status] ?? status}
                      </span>
                      <p className="mt-2 font-display text-2xl text-gold-deep">{formatXOF(Number(r.total_price))}</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-5">
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Arrivée</p>
                      <p className="mt-1 font-medium">{checkIn}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Départ</p>
                      <p className="mt-1 font-medium">{checkOut}</p>
                    </div>
                    {r.promo_code && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Promotion</p>
                        <p className="mt-1 font-medium text-emerald-700">{r.promo_code}{r.discount_percent ? ` (-${r.discount_percent}%)` : ""}</p>
                      </div>
                    )}
                  </div>
                  <StayTimeline status={status} />
                  <div className="mt-6 flex flex-wrap gap-2 border-t border-border/60 pt-5">
                    <Button size="sm" variant="goldOutline" onClick={() => downloadPDF(r, "invoice")}>
                      <Download className="mr-1 size-4" /> Facture PDF
                    </Button>
                    {r.paid_at && (
                      <Button size="sm" variant="outline" onClick={() => downloadPDF(r, "receipt")}>
                        <Receipt className="mr-1 size-4" /> Reçu
                      </Button>
                    )}
                    {canCancel && (
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleCancel(r.id, r.reference)}>
                        <XCircle className="mr-1 size-4" /> Annuler
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}
