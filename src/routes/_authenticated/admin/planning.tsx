import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight, BedDouble, CalendarCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminI18n } from "@/hooks/use-admin-i18n";
import { AdminModuleLayout, AdminChartCard } from "@/components/admin/AdminModuleLayout";
import {
  eachDay, fetchPlanningData, formatDayKey, PLANNING_STATUS_COLOR, reservationCoversDay,
} from "@/lib/planning";
import { STATUS_LABEL } from "@/lib/reservations";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/_authenticated/admin/planning")({
  component: AdminPlanning,
});

type ViewMode = "week" | "month";

function AdminPlanning() {
  const { ta, lang } = useAdminI18n();
  const locale = lang === "en" ? enUS : fr;
  const [cursor, setCursor] = useState(() => new Date());
  const [view, setView] = useState<ViewMode>("week");

  const range = useMemo(() => {
    if (view === "week") {
      const from = startOfWeek(cursor, { weekStartsOn: 1 });
      const to = endOfWeek(cursor, { weekStartsOn: 1 });
      return { from, to, label: `${ta.common.week} — ${format(from, "d MMM", { locale })}` };
    }
    const from = startOfMonth(cursor);
    const to = endOfMonth(cursor);
    return { from, to, label: format(cursor, "MMMM yyyy", { locale }) };
  }, [cursor, view, ta.common.week, locale]);

  const days = useMemo(() => eachDay(range.from, range.to), [range]);
  const fromKey = formatDayKey(range.from);
  const toKey = formatDayKey(addDays(range.to, 1));

  const { data, isLoading } = useQuery({
    queryKey: ["admin-planning", fromKey, toKey],
    queryFn: () => fetchPlanningData(fromKey, toKey),
  });

  const stats = useMemo(() => {
    const rooms = data?.rooms ?? [];
    const res = data?.reservations ?? [];
    const totalCells = rooms.length * days.length;
    let booked = 0;
    for (const room of rooms) {
      for (const d of days) {
        if (res.some((r) => r.room_id === room.id && reservationCoversDay(r, formatDayKey(d)))) booked++;
      }
    }
    const rate = totalCells > 0 ? Math.round((booked / totalCells) * 100) : 0;
    return { booked, free: totalCells - booked, rate, resCount: res.length };
  }, [data, days]);

  const dailyChart = useMemo(() => {
    const res = data?.reservations ?? [];
    return days.map((d) => {
      const key = formatDayKey(d);
      const count = res.filter((r) => reservationCoversDay(r, key)).length;
      return { day: format(d, "dd/MM"), count };
    });
  }, [data, days]);

  function shift(dir: -1 | 1) {
    setCursor((c) => {
      const d = new Date(c);
      if (view === "week") d.setDate(d.getDate() + dir * 7);
      else d.setMonth(d.getMonth() + dir);
      return d;
    });
  }

  return (
    <AdminModuleLayout
      label={ta.planning.label}
      title={ta.planning.title}
      subtitle={ta.planning.subtitle}
      stats={[
        { label: ta.planning.occupancyRate, value: `${stats.rate}%`, Icon: TrendingUp, accent: true },
        { label: ta.planning.bookedNights, value: stats.booked, Icon: CalendarCheck },
        { label: ta.planning.freeNights, value: stats.free, Icon: BedDouble },
        { label: ta.nav.reservations, value: stats.resCount, Icon: CalendarCheck },
      ]}
      actions={
        <Button variant="hero" size="sm" asChild>
          <Link to="/admin/reservations">+ {ta.dashboard.newReservation}</Link>
        </Button>
      }
      toolbar={
        <>
          <div className="flex rounded-lg border border-border bg-card p-1">
            {(["week", "month"] as ViewMode[]).map((v) => (
              <button key={v} type="button" onClick={() => setView(v)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${view === v ? "bg-onyx text-white" : "text-muted-foreground hover:text-foreground"}`}>
                {v === "week" ? ta.common.week : ta.common.month}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={() => shift(-1)}><ChevronLeft className="size-4" /></Button>
          <span className="min-w-[140px] text-center text-sm font-medium capitalize">{range.label}</span>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>{ta.common.today}</Button>
          <Button variant="outline" size="icon" onClick={() => shift(1)}><ChevronRight className="size-4" /></Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <AdminChartCard title={ta.dashboard.reservations14d} className="lg:col-span-1">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChart}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#C9A227" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <div className="lg:col-span-2 flex flex-wrap gap-3 text-xs">
          {(["pending", "confirmed", "checked_in"] as const).map((s) => (
            <span key={s} className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
              <span className={`size-3 rounded-full ${PLANNING_STATUS_COLOR[s]}`} />
              {STATUS_LABEL[s]}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-[#f8f6f1]">
              <th className="sticky left-0 z-10 min-w-[140px] bg-[#f8f6f1] px-3 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-foreground/70">
                {ta.planning.room}
              </th>
              {days.map((d) => (
                <th key={formatDayKey(d)} className="min-w-[72px] px-1 py-2 text-center text-xs font-normal">
                  <div className="text-muted-foreground">{format(d, "EEE", { locale })}</div>
                  <div className={`font-semibold ${formatDayKey(d) === formatDayKey(new Date()) ? "text-gold-deep" : ""}`}>{format(d, "d")}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={days.length + 1} className="p-12 text-center text-muted-foreground">{ta.common.loading}</td></tr>
            ) : (data?.rooms ?? []).length === 0 ? (
              <tr><td colSpan={days.length + 1} className="p-12 text-center text-muted-foreground">{ta.planning.noRooms}</td></tr>
            ) : (data?.rooms ?? []).map((room) => (
              <tr key={room.id} className="border-t border-border/60 hover:bg-gold-soft/5">
                <td className="sticky left-0 z-10 bg-card px-3 py-2">
                  <div className="font-medium">n° {room.number}</div>
                  <div className="max-w-[120px] truncate text-xs text-muted-foreground">{room.name}</div>
                </td>
                {days.map((d) => {
                  const key = formatDayKey(d);
                  const res = (data?.reservations ?? []).find(
                    (r) => r.room_id === room.id && reservationCoversDay(r, key),
                  );
                  return (
                    <td key={key} className="border-l border-border/40 p-0.5 align-top">
                      {res ? (
                        <Link to="/admin/reservations" className={`block rounded px-1 py-1 text-[10px] leading-tight truncate ${PLANNING_STATUS_COLOR[res.status]}`}
                          title={`${res.reference} · ${res.profiles?.full_name ?? "Client"}`}>
                          {res.profiles?.full_name?.split(" ")[0] ?? res.reference}
                        </Link>
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
    </AdminModuleLayout>
  );
}
