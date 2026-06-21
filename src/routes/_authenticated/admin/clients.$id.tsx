import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatXOF } from "@/lib/rooms";
import { STATUS_BADGE, STATUS_LABEL, type ReservationStatus } from "@/lib/reservations";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/clients/$id")({
  component: ClientDetail,
});

function ClientDetail() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-client", id],
    queryFn: async () => {
      const [{ data: profile }, { data: reservations }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
        supabase.from("reservations").select("*, rooms(name, number)").eq("profile_id", id).order("check_in", { ascending: false }),
      ]);
      return { profile, reservations: reservations ?? [] };
    },
  });

  if (isLoading) return <div className="p-12 text-muted-foreground">Chargement…</div>;
  if (!data?.profile) return <div className="p-12">Client introuvable</div>;

  const { profile, reservations } = data;
  const stays = reservations.filter((r: any) => r.status !== "cancelled");
  const totalSpent = stays.reduce((s: number, r: any) => s + Number(r.total_price), 0);

  return (
    <div className="p-6 lg:p-10">
      <Link to="/admin/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold-deep">
        <ArrowLeft className="size-4" /> Tous les clients
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="rounded-xl border border-border bg-card p-6">
          <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Fiche client</span>
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
                <Sparkles className="size-3" /> Préférences
              </p>
              <p className="mt-1 text-foreground/80">{profile.preferences}</p>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-secondary/40 p-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Séjours</p>
              <p className="font-display text-2xl">{stays.length}</p>
            </div>
            <div className="rounded-md bg-secondary/40 p-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Total dépensé</p>
              <p className="font-display text-2xl text-gold-deep">{formatXOF(totalSpent)}</p>
            </div>
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