import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatXOF } from "@/lib/rooms";
import { STATUS_BADGE, STATUS_LABEL, type ReservationStatus } from "@/lib/reservations";
import { computeClientInsights, VIP_TIER_STYLES } from "@/lib/crm-insights";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Mail, Phone, MapPin, Sparkles, Save, Crown, Star, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/clients/$id")({
  component: ClientDetail,
});

function ClientDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", address: "", city: "", country: "", preferences: "" });
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-client", id],
    queryFn: async () => {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      const [{ data: reservations }, reviewRes] = await Promise.all([
        supabase.from("reservations").select("*, rooms(name, number, type)").eq("profile_id", id).order("check_in", { ascending: false }),
        profile?.email
          ? supabase.from("reviews").select("id", { count: "exact", head: true }).eq("author_email", profile.email)
          : Promise.resolve({ count: 0 }),
      ]);
      return { profile, reservations: reservations ?? [], reviewCount: reviewRes.count ?? 0 };
    },
  });

  if (isLoading) return <div className="p-12 text-muted-foreground">Chargement…</div>;
  if (!data?.profile) return <div className="p-12">Client introuvable</div>;

  const { profile, reservations, reviewCount } = data;
  const stays = reservations.filter((r: any) => r.status !== "cancelled");

  const insights = computeClientInsights({
    stays: stays.map((r: any) => ({
      status: r.status,
      total_price: r.total_price,
      check_in: r.check_in,
      room_type: r.rooms?.type,
    })),
    reviewCount,
    preferences: profile.preferences,
  });

  function startEdit() {
    setForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      city: profile.city ?? "",
      country: profile.country ?? "",
      preferences: profile.preferences ?? "",
    });
    setEditing(true);
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: form.full_name || null,
        phone: form.phone || null,
        address: form.address || null,
        city: form.city || null,
        country: form.country || null,
        preferences: form.preferences || null,
      }).eq("id", id);
      if (error) throw error;
      toast.success("Fiche client mise à jour");
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["admin-client", id] });
      qc.invalidateQueries({ queryKey: ["admin-clients"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <Link to="/admin/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold-deep">
        <ArrowLeft className="size-4" /> Tous les clients
      </Link>

      <div className="client-hero-band rounded-xl px-6 py-8 text-white shadow-elegant">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold-soft/80">Profil client 360°</p>
            <h1 className="mt-2 font-display text-4xl">{profile.full_name || "Sans nom"}</h1>
            <p className="mt-1 text-white/70">{profile.email}</p>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${VIP_TIER_STYLES[insights.vipTier]}`}>
              <Crown className="size-4" />{insights.vipTier}
            </span>
            <p className="mt-2 text-sm text-white/70">Score VIP : <strong className="text-gold-soft">{insights.vipScore}/100</strong></p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Séjours", value: insights.totalStays, Icon: Star },
          { label: "Total dépensé", value: formatXOF(insights.totalSpent), Icon: TrendingUp },
          { label: "Panier moyen", value: formatXOF(insights.avgStayValue), Icon: TrendingUp },
          { label: "Points fidélité", value: insights.loyaltyPoints, Icon: Crown },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="stat-card-premium rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Icon className="size-4 text-gold-deep" />{label}
            </div>
            <p className="mt-2 font-display text-2xl">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Fiche client</span>
            {hasPermission("client.edit") && !editing && (
              <Button size="sm" variant="outline" onClick={startEdit}>Modifier</Button>
            )}
          </div>

          {editing ? (
            <div className="mt-4 space-y-3">
              {[
                { k: "full_name", l: "Nom complet" },
                { k: "phone", l: "Téléphone" },
                { k: "address", l: "Adresse" },
                { k: "city", l: "Ville" },
                { k: "country", l: "Pays" },
              ].map(({ k, l }) => (
                <label key={k} className="block text-xs uppercase tracking-wider text-muted-foreground">{l}
                  <input value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-input px-3 py-2 text-sm" />
                </label>
              ))}
              <label className="block text-xs uppercase tracking-wider text-muted-foreground">Notes CRM / préférences
                <textarea rows={3} value={form.preferences} onChange={(e) => setForm({ ...form, preferences: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-input px-3 py-2 text-sm" />
              </label>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
                <Button variant="hero" onClick={saveProfile} disabled={saving}>
                  <Save className="mr-1 size-4" />{saving ? "…" : "Enregistrer"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="mt-2 font-display text-3xl">{profile.full_name || "Sans nom"}</h1>
              <div className="mt-4 space-y-2 text-sm">
                {profile.email && <p className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /> {profile.email}</p>}
                {profile.phone && <p className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" /> {profile.phone}</p>}
                {(profile.address || profile.city || profile.country) && (
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4 text-muted-foreground" />
                    {[profile.address, profile.city, profile.country].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
              {profile.preferences && (
                <div className="mt-4 rounded-md bg-secondary/40 p-3 text-sm">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-gold-deep">
                    <Sparkles className="size-3" /> Notes CRM
                  </p>
                  <p className="mt-1 text-foreground/80 whitespace-pre-wrap">{profile.preferences}</p>
                </div>
              )}
            </>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-secondary/40 p-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Dernier séjour</p>
              <p className="font-display text-lg">{insights.lastStay ?? "—"}</p>
            </div>
            <div className="rounded-md bg-secondary/40 p-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Chambre préférée</p>
              <p className="font-display text-lg">{insights.preferredRoomType ?? "—"}</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-gold/20 bg-gold-soft/20 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-deep">
              <Sparkles className="size-3.5" /> Recommandations
            </p>
            <ul className="mt-2 space-y-1 text-sm text-foreground/80">
              {insights.recommendations.map((rec) => <li key={rec}>• {rec}</li>)}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl">Historique des réservations</h2>
          {reservations.length === 0 ? (
            <p className="mt-4 text-muted-foreground">Aucune réservation pour ce client.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border/60">
              {reservations.map((r: any) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{r.reference}</p>
                    <p>{r.rooms?.name} <span className="text-muted-foreground">· {r.check_in} → {r.check_out} · {r.nights}n</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${STATUS_BADGE[r.status as ReservationStatus]}`}>{STATUS_LABEL[r.status as ReservationStatus]}</span>
                    <span className="font-medium text-gold-deep">{formatXOF(Number(r.total_price))}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6">
            <Button variant="goldOutline" asChild>
              <Link to="/admin/reservations">Voir toutes les réservations</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
