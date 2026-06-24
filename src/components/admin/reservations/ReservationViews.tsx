import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { formatXOF } from "@/lib/rooms";
import {
  STATUS_BADGE, STATUS_LABEL, type ReservationStatus,
} from "@/lib/reservations";
import { CheckCircle2, Edit3, Receipt, XCircle } from "lucide-react";

export type ReservationRow = {
  id: string;
  reference: string;
  status: ReservationStatus;
  check_in: string;
  check_out: string;
  nights: number;
  guests_count: number;
  total_price: number;
  paid_at: string | null;
  rooms?: { name?: string; number?: string } | null;
  profiles?: { full_name?: string; email?: string } | null;
};

const KANBAN_COLUMNS: { status: ReservationStatus; label: string; color: string }[] = [
  { status: "pending", label: "En attente", color: "border-amber-300 bg-amber-50/50" },
  { status: "confirmed", label: "Confirmée", color: "border-emerald-300 bg-emerald-50/50" },
  { status: "checked_in", label: "Arrivée", color: "border-sky-300 bg-sky-50/50" },
  { status: "checked_out", label: "Départ", color: "border-slate-300 bg-slate-50/50" },
  { status: "cancelled", label: "Annulée", color: "border-rose-300 bg-rose-50/50" },
];

type ViewProps = {
  rows: ReservationRow[];
  onEdit?: (r: ReservationRow) => void;
  onPay?: (r: ReservationRow) => void;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
};

export function ReservationKanban({ rows, onEdit, onPay, onConfirm, onCancel }: ViewProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((col) => {
        const items = rows.filter((r) => r.status === col.status);
        return (
          <div key={col.status} className={`kanban-column min-w-[260px] flex-1 rounded-xl border-2 ${col.color} p-3`}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider">{col.label}</h3>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium shadow-sm">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">Aucune</p>
              ) : items.map((r) => (
                <div key={r.id} className="kanban-card rounded-lg border border-border/60 bg-white p-3 shadow-sm transition hover:shadow-md">
                  <p className="font-mono text-[10px] text-muted-foreground">{r.reference}</p>
                  <p className="mt-1 font-medium">{r.profiles?.full_name ?? "Client"}</p>
                  <p className="text-xs text-muted-foreground">{r.rooms?.name} · n° {r.rooms?.number}</p>
                  <p className="mt-2 text-xs">{r.check_in} → {r.check_out}</p>
                  <p className="mt-1 text-sm font-medium text-gold-deep">{formatXOF(Number(r.total_price))}</p>
                  <div className="mt-2 flex gap-1">
                    {onEdit && <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => onEdit(r)}><Edit3 className="size-3.5" /></Button>}
                    {r.status === "pending" && onConfirm && (
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => onConfirm(r.id)}><CheckCircle2 className="size-3.5 text-emerald-600" /></Button>
                    )}
                    {!r.paid_at && onPay && r.status !== "cancelled" && (
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => onPay(r)}><Receipt className="size-3.5" /></Button>
                    )}
                    {r.status !== "cancelled" && onCancel && (
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => onCancel(r.id)}><XCircle className="size-3.5 text-destructive" /></Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ReservationCards({ rows, onEdit, onPay }: ViewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((r) => (
        <article key={r.id} className="reservation-card group rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-gold-deep/30 hover:shadow-elegant">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-mono text-xs text-muted-foreground">{r.reference}</p>
              <h3 className="mt-1 font-display text-xl">{r.profiles?.full_name ?? "Client"}</h3>
              <p className="text-sm text-muted-foreground">{r.profiles?.email}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${STATUS_BADGE[r.status]}`}>
              {STATUS_LABEL[r.status]}
            </span>
          </div>
          <div className="mt-4 rounded-lg bg-secondary/40 p-3 text-sm">
            <p className="font-medium">{r.rooms?.name}</p>
            <p className="text-muted-foreground">Chambre n° {r.rooms?.number}</p>
            <p className="mt-2">{r.check_in} → {r.check_out} · {r.nights}n · {r.guests_count} pers.</p>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <p className="font-display text-2xl text-gold-deep">{formatXOF(Number(r.total_price))}</p>
            {r.paid_at && <span className="text-[10px] font-medium text-emerald-700">✓ Payé</span>}
          </div>
          <div className="mt-4 flex gap-2 opacity-80 group-hover:opacity-100">
            {onEdit && <Button size="sm" variant="outline" onClick={() => onEdit(r)}>Modifier</Button>}
            {!r.paid_at && onPay && r.status !== "cancelled" && (
              <Button size="sm" variant="hero" onClick={() => onPay(r)}>Encaisser</Button>
            )}
            <Button size="sm" variant="ghost" asChild>
              <Link to="/admin/clients/$id" params={{ id: (r as any).profile_id ?? "" }}>Fiche client</Link>
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

export type ViewMode = "table" | "cards" | "kanban";

export function ViewModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const modes: { id: ViewMode; label: string }[] = [
    { id: "table", label: "Tableau" },
    { id: "cards", label: "Cartes" },
    { id: "kanban", label: "Kanban" },
  ];
  return (
    <div className="view-mode-toggle inline-flex rounded-lg border border-border bg-card p-1 shadow-sm">
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            mode === m.id ? "bg-onyx text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
