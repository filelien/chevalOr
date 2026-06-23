import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { DashboardAlert } from "@/lib/admin-stats";

export function AdminPageHeader({
  label,
  title,
  subtitle,
  children,
}: {
  label?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-6">
      <div>
        {label && <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">{label}</span>}
        <h1 className="mt-2 font-display text-3xl md:text-4xl text-foreground">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  Icon,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  Icon?: React.ComponentType<{ className?: string }>;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm transition hover:shadow-md ${accent ? "border-gold/40 bg-gradient-to-br from-gold-soft/30 to-card" : "border-border bg-card"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        {Icon && <Icon className="size-4 shrink-0 text-gold-deep" />}
      </div>
      <p className="mt-2 font-display text-2xl md:text-3xl tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const alertStyles: Record<DashboardAlert["level"], string> = {
  critical: "border-red-500/40 bg-red-50 text-red-900",
  warning: "border-amber-500/40 bg-amber-50 text-amber-900",
  info: "border-blue-500/40 bg-blue-50 text-blue-900",
  success: "border-emerald-500/40 bg-emerald-50 text-emerald-900",
};

export function AlertCard({ alert }: { alert: DashboardAlert }) {
  const inner = (
    <div className={`rounded-lg border px-3 py-2.5 text-sm ${alertStyles[alert.level]}`}>
      <p className="font-medium">{alert.title}</p>
      <p className="text-xs opacity-80">{alert.detail}</p>
    </div>
  );
  if (alert.link) {
    return <Link to={alert.link as "/admin"}>{inner}</Link>;
  }
  return inner;
}
