import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatXOF } from "@/lib/rooms";
import {
  STATUS_BADGE, STATUS_LABEL, type ReservationStatus,
  cancelReservation, confirmReservation, createWalkInReservation, isRoomAvailable,
  markPaid, setReservationStatus, updateReservationDates,
} from "@/lib/reservations";
import { generateInvoicePDF } from "@/lib/invoice";
import { downloadCsv } from "@/lib/export-csv";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, FileText, Receipt, Edit3, Search, Plus, Download, Mail } from "lucide-react";
import {
  ViewModeToggle, ReservationKanban, ReservationCards, type ViewMode,
} from "@/components/admin/reservations/ReservationViews";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/_authenticated/admin/reservations")({
  component: AdminReservations,
});

const STATUSES: Array<ReservationStatus | "all"> = ["all", "pending", "confirmed", "checked_in", "checked_out", "cancelled"];

function AdminReservations() {
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
  const [filter, setFilter] = useState<ReservationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [paying, setPaying] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*, rooms(name, number, price_per_night), profiles(full_name, email, phone, address)")
        .order("check_in", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: pendingGuestReservations = [] } = useQuery({
    queryKey: ["admin-pending-guest-reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("id, reference, check_in, check_out, total_price, created_at, status, profiles(full_name, email, phone), rooms(name, number)")
        .eq("source", "guest_portal")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    return (data ?? []).filter((r: any) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${r.reference} ${r.rooms?.name ?? ""} ${r.rooms?.number ?? ""} ${r.profiles?.full_name ?? ""} ${r.profiles?.email ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data, filter, search]);

  async function action(fn: () => Promise<void>, ok: string) {
    try { await fn(); toast.success(ok); qc.invalidateQueries({ queryKey: ["admin-reservations"] }); }
    catch (e: any) { toast.error(e.message); }
  }

  function pdf(r: any, type: "invoice" | "receipt") {
    generateInvoicePDF({
      reference: r.reference, type,
      client: {
        name: r.profiles?.full_name || "Client",
        email: r.profiles?.email, phone: r.profiles?.phone, address: r.profiles?.address,
      },
      room: { name: r.rooms?.name ?? "", number: r.rooms?.number ?? "" },
      check_in: r.check_in, check_out: r.check_out, nights: r.nights, guests_count: r.guests_count,
      price_per_night: Number(r.rooms?.price_per_night ?? r.total_price / Math.max(1, r.nights)),
      total: Number(r.total_price),
      payment_method: r.payment_method, paid_at: r.paid_at,
    });
  }

  function exportCsv() {
    downloadCsv(
      `reservations-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Référence", "Client", "Email", "Chambre", "Arrivée", "Départ", "Nuits", "Total", "Statut", "Payé"],
      filtered.map((r: any) => [
        r.reference,
        r.profiles?.full_name ?? "",
        r.profiles?.email ?? "",
        r.rooms?.name ?? "",
        r.check_in,
        r.check_out,
        r.nights,
        r.total_price,
        STATUS_LABEL[r.status as ReservationStatus],
        r.paid_at ? "Oui" : "Non",
      ]),
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminPageHeader
        label="PMS · Réservations"
        title="Gestion des réservations"
        subtitle="Vues tableau, cartes et kanban — check-in, encaissement et walk-in."
      >
        <div className="flex flex-wrap items-center gap-2">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          {hasPermission("reservation.export") && (
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="mr-1 size-4" />Exporter
            </Button>
          )}
          {hasPermission("reservation.create") && (
            <Button variant="hero" size="sm" onClick={() => setCreating(true)}>
              <Plus className="mr-1 size-4" />Nouvelle réservation
            </Button>
          )}
        </div>
      </AdminPageHeader>

      {pendingGuestReservations.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-900">
            <Mail className="size-4" />
            <h3 className="font-semibold">Vérification email en attente</h3>
          </div>
          <p className="mt-1 text-sm text-amber-800">
            {pendingGuestReservations.length} réservation(s) invitée(s) attendent la validation email avant confirmation.
          </p>
          <div className="mt-4 space-y-2">
            {pendingGuestReservations.map((r: any) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-white/70 p-3">
                <div>
                  <div className="font-medium text-slate-900">{r.profiles?.full_name ?? "Client invité"}</div>
                  <div className="text-sm text-slate-600">{r.profiles?.email} · {r.profiles?.phone ?? "—"}</div>
                  <div className="text-xs text-slate-500">{r.reference} · {r.rooms?.name ?? "—"} · {r.check_in} → {r.check_out}</div>
                </div>
                <Button size="sm" variant="hero" onClick={() => action(() => confirmReservation(r.id), "Réservation confirmée")}>Valider</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (réf., client, chambre)…"
            className="w-72 rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1 text-xs ${filter === s ? "bg-onyx text-white" : "bg-secondary text-foreground/70"}`}>
              {s === "all" ? "Toutes" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">Aucune réservation.</p>
      ) : viewMode === "kanban" ? (
        <ReservationKanban
          rows={filtered}
          onEdit={setEditing}
          onPay={setPaying}
          onConfirm={(id) => action(() => confirmReservation(id), "Confirmée")}
          onCancel={(id) => { if (confirm("Annuler ?")) action(() => cancelReservation(id, "Annulée par le personnel"), "Annulée"); }}
        />
      ) : viewMode === "cards" ? (
        <ReservationCards rows={filtered} onEdit={setEditing} onPay={setPaying} />
      ) : (
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Référence</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Chambre</th>
              <th className="px-4 py-3">Séjour</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Chargement…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Aucune réservation.</td></tr>
            ) : filtered.map((r: any) => (
              <tr key={r.id} className="border-t border-border/60 align-top">
                <td className="px-4 py-3 font-mono text-xs">{r.reference}</td>
                <td className="px-4 py-3">
                  <div>{r.profiles?.full_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{r.profiles?.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{r.rooms?.name}</div>
                  <div className="text-xs text-muted-foreground">n° {r.rooms?.number}</div>
                </td>
                <td className="px-4 py-3">
                  {r.check_in} → {r.check_out}
                  <div className="text-xs text-muted-foreground">{r.nights} nuit(s) · {r.guests_count} pers.</div>
                </td>
                <td className="px-4 py-3 font-medium text-gold-deep">{formatXOF(Number(r.total_price))}</td>
                <td className="px-4 py-3">
                  <select
                    value={r.status}
                    onChange={(e) => action(() => setReservationStatus(r.id, e.target.value as ReservationStatus), "Statut mis à jour")}
                    className={`rounded-full px-2 py-1 text-xs ${STATUS_BADGE[r.status as ReservationStatus]}`}
                  >
                    {(["pending","confirmed","checked_in","checked_out","cancelled"] as ReservationStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                  {r.paid_at && <div className="mt-1 text-[10px] text-emerald-700">Payé</div>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-1">
                    {r.status === "pending" && (
                      <Button size="sm" variant="ghost" title="Confirmer"
                        onClick={() => action(() => confirmReservation(r.id), "Confirmée")}>
                        <CheckCircle2 className="size-4 text-emerald-600" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" title="Modifier" onClick={() => setEditing(r)}>
                      <Edit3 className="size-4" />
                    </Button>
                    <Button size="sm" variant="ghost" title="Facture" onClick={() => pdf(r, "invoice")}>
                      <FileText className="size-4" />
                    </Button>
                    {!r.paid_at && r.status !== "cancelled" && (
                      <Button size="sm" variant="ghost" title="Marquer payé" onClick={() => setPaying(r)}>
                        <Receipt className="size-4 text-gold-deep" />
                      </Button>
                    )}
                    {r.paid_at && (
                      <Button size="sm" variant="ghost" title="Reçu" onClick={() => pdf(r, "receipt")}>
                        <Receipt className="size-4" />
                      </Button>
                    )}
                    {r.status !== "cancelled" && (
                      <Button size="sm" variant="ghost" title="Annuler"
                        onClick={() => { if (confirm("Annuler cette réservation ?")) action(() => cancelReservation(r.id, "Annulée par le personnel"), "Annulée"); }}>
                        <XCircle className="size-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      <EditDatesDialog reservation={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin-reservations"] }); }} />
      <PayDialog reservation={paying} onClose={() => setPaying(null)} onSaved={() => { setPaying(null); qc.invalidateQueries({ queryKey: ["admin-reservations"] }); }} />
      <CreateReservationDialog open={creating} onClose={() => setCreating(false)} onSaved={() => { setCreating(false); qc.invalidateQueries({ queryKey: ["admin-reservations"] }); }} />
    </div>
  );
}

function EditDatesDialog({ reservation, onClose, onSaved }: { reservation: any | null; onClose: () => void; onSaved: () => void }) {
  const [ci, setCi] = useState("");
  const [co, setCo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (reservation) { setCi(reservation.check_in); setCo(reservation.check_out); }
  }, [reservation]);

  if (!reservation) return null;

  async function save() {
    setBusy(true);
    try { await updateReservationDates(reservation.id, ci, co); toast.success("Dates mises à jour"); onSaved(); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Modifier les dates · {reservation.reference}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Arrivée
            <input type="date" value={ci} onChange={(e) => setCi(e.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Départ
            <input type="date" value={co} onChange={(e) => setCo(e.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="hero" onClick={save} disabled={busy}>{busy ? "…" : "Enregistrer"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PayDialog({ reservation, onClose, onSaved }: { reservation: any | null; onClose: () => void; onSaved: () => void }) {
  const [method, setMethod] = useState("Espèces");
  const [amount, setAmount] = useState<number>(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (reservation) setAmount(Number(reservation.total_price));
  }, [reservation]);

  if (!reservation) return null;

  async function save() {
    setBusy(true);
    try { await markPaid(reservation.id, method, amount); toast.success("Paiement enregistré"); onSaved(); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Encaisser · {reservation.reference}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <label className="block text-xs uppercase tracking-wider text-muted-foreground">Méthode
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option>Espèces</option>
              <option>Carte bancaire</option>
              <option>Mobile Money</option>
              <option>Virement</option>
            </select>
          </label>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground">Montant (XOF)
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="hero" onClick={save} disabled={busy}>{busy ? "…" : "Valider"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateReservationDialog({
  open, onClose, onSaved,
}: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [profileQuery, setProfileQuery] = useState("");
  const [profileId, setProfileId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [busy, setBusy] = useState(false);

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles-search", profileQuery],
    queryFn: async () => {
      if (!profileQuery.trim()) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .or(`full_name.ilike.%${profileQuery}%,email.ilike.%${profileQuery}%`)
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
    enabled: profileQuery.length >= 2,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["admin-rooms-active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("id, name, number, price_per_night, capacity").eq("is_active", true).order("number");
      if (error) throw error;
      return data ?? [];
    },
    enabled: open,
  });

  const selectedRoom = rooms.find((r) => r.id === roomId);
  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;
  const total = nights * Number(selectedRoom?.price_per_night ?? 0);

  async function save() {
    if (!profileId || !roomId || nights <= 0) {
      toast.error("Complétez client, chambre et dates");
      return;
    }
    setBusy(true);
    try {
      const ok = await isRoomAvailable(roomId, checkIn, checkOut);
      if (!ok) { toast.error("Chambre indisponible sur ces dates"); return; }
      await createWalkInReservation({
        room_id: roomId,
        profile_id: profileId,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: guests,
        total_price: total,
        status: "confirmed",
      });
      toast.success("Réservation créée");
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nouvelle réservation (walk-in)</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <label className="block text-xs uppercase tracking-wider text-muted-foreground">Rechercher client
            <input value={profileQuery} onChange={(e) => setProfileQuery(e.target.value)}
              placeholder="Nom ou email…"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
          {profiles.length > 0 && (
            <div className="max-h-32 overflow-y-auto rounded-md border border-border">
              {profiles.map((p: any) => (
                <button key={p.id} type="button" onClick={() => { setProfileId(p.id); setProfileQuery(`${p.full_name ?? ""} (${p.email})`); }}
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-secondary ${profileId === p.id ? "bg-secondary" : ""}`}>
                  {p.full_name ?? "—"} · {p.email}
                </button>
              ))}
            </div>
          )}
          <label className="block text-xs uppercase tracking-wider text-muted-foreground">Chambre
            <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Sélectionner…</option>
              {rooms.map((r: any) => (
                <option key={r.id} value={r.id}>n° {r.number} — {r.name}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Arrivée
              <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </label>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Départ
              <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </label>
          </div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground">Personnes
            <input type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
          {total > 0 && <p className="text-sm text-gold-deep">Total estimé : {formatXOF(total)} ({nights} nuit(s))</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="hero" onClick={save} disabled={busy}>{busy ? "…" : "Créer"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}