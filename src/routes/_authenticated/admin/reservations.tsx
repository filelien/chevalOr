import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatXOF } from "@/lib/rooms";
import {
  STATUS_BADGE, STATUS_LABEL, type ReservationStatus,
  cancelReservation, confirmReservation, markPaid, setReservationStatus, updateReservationDates,
} from "@/lib/reservations";
import { generateInvoicePDF } from "@/lib/invoice";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, FileText, Receipt, Edit3, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/reservations")({
  component: AdminReservations,
});

const STATUSES: Array<ReservationStatus | "all"> = ["all", "pending", "confirmed", "checked_in", "checked_out", "cancelled"];

function AdminReservations() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<ReservationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [paying, setPaying] = useState<any | null>(null);

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

  return (
    <div className="p-6 lg:p-10">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Module 3</span>
        <h1 className="mt-2 font-display text-4xl">Réservations</h1>
      </div>

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

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
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

      <EditDatesDialog reservation={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin-reservations"] }); }} />
      <PayDialog reservation={paying} onClose={() => setPaying(null)} onSaved={() => { setPaying(null); qc.invalidateQueries({ queryKey: ["admin-reservations"] }); }} />
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