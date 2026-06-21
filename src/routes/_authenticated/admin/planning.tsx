import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  eachDay, fetchPlanningData, formatDayKey, PLANNING_STATUS_COLOR, reservationCoversDay,
} from "@/lib/planning";
import { STATUS_LABEL } from "@/lib/reservations";

export const Route = createFileRoute("/_authenticated/admin/planning")({
  component: AdminPlanning,
});

type ViewMode = "week" | "month";

function AdminPlanning() {
  const [cursor, setCursor] = useState(() => new Date());
  const [view, setView] = useState<ViewMode>("week");

  const range = useMemo(() => {
    if (view === "week") {
      const from = startOfWeek(cursor, { weekStartsOn: 1 });
      const to = endOfWeek(cursor, { weekStartsOn: 1 });
      return { from, to, label: `Semaine du ${format(from, "d MMM", { locale: fr })}` };
    }
    const from = startOfMonth(cursor);
    const to = endOfMonth(cursor);
    return { from, to, label: format(cursor, "MMMM yyyy", { locale: fr }) };
  }, [cursor, view]);

  const days = useMemo(() => eachDay(range.from, range.to), [range]);
  const fromKey = formatDayKey(range.from);
  const toKey = formatDayKey(addDays(range.to, 1));

  const { data, isLoading } = useQuery({
    queryKey: ["admin-planning", fromKey, toKey],
    queryFn: () => fetchPlanningData(fromKey, toKey),
  });

  function shift(dir: -1 | 1) {
    setCursor((c) => {
      const d = new Date(c);
      if (view === "week") d.setDate(d.getDate() + dir * 7);
      else d.setMonth(d.getMonth() + dir);
      return d;
    });
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Module 1</span>
          <h1 className="mt-2 font-display text-4xl">Planning hôtel</h1>
          <p className="mt-1 text-sm text-muted-foreground capitalize">{range.label}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border bg-card p-1">
            {(["week", "month"] as ViewMode[]).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`rounded-md px-3 py-1.5 text-xs capitalize ${view === v ? "bg-onyx text-white" : "text-muted-foreground"}`}>
                {v === "week" ? "Semaine" : "Mois"}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={() => shift(-1)}><ChevronLeft className="size-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>Aujourd'hui</Button>
          <Button variant="outline" size="icon" onClick={() => shift(1)}><ChevronRight className="size-4" /></Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {(["pending", "confirmed", "checked_in"] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={`size-3 rounded ${PLANNING_STATUS_COLOR[s]}`} />
            {STATUS_LABEL[s]}
          </span>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="sticky left-0 z-10 min-w-[140px] bg-secondary/50 px-3 py-2 text-left text-xs uppercase tracking-wider text-muted-foreground">Chambre</th>
              {days.map((d) => (
                <th key={formatDayKey(d)} className="min-w-[72px] px-1 py-2 text-center text-xs font-normal">
                  <div className="text-muted-foreground">{format(d, "EEE", { locale: fr })}</div>
                  <div className={`font-medium ${formatDayKey(d) === formatDayKey(new Date()) ? "text-gold-deep" : ""}`}>{format(d, "d")}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={days.length + 1} className="p-8 text-center text-muted-foreground">Chargement…</td></tr>
            ) : (data?.rooms ?? []).length === 0 ? (
              <tr><td colSpan={days.length + 1} className="p-8 text-center text-muted-foreground">Aucune chambre active.</td></tr>
            ) : (data?.rooms ?? []).map((room) => (
              <tr key={room.id} className="border-t border-border/60">
                <td className="sticky left-0 z-10 bg-card px-3 py-2">
                  <div className="font-medium">n° {room.number}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[120px]">{room.name}</div>
                </td>
                {days.map((d) => {
                  const key = formatDayKey(d);
                  const res = (data?.reservations ?? []).find(
                    (r) => r.room_id === room.id && reservationCoversDay(r, key),
                  );
                  return (
                    <td key={key} className="border-l border-border/40 p-0.5 align-top">
                      {res ? (
                        <div
                          title={`${res.reference} · ${res.profiles?.full_name ?? "Client"} · ${STATUS_LABEL[res.status]}`}
                          className={`rounded px-1 py-1 text-[10px] leading-tight truncate ${PLANNING_STATUS_COLOR[res.status]}`}
                        >
                          {res.profiles?.full_name?.split(" ")[0] ?? res.reference}
                        </div>
                      ) : (
                        <div className="h-7" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
