import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { StatCard } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import type { DashboardKind } from "@/lib/dashboard-role";
import { DASHBOARD_META } from "@/lib/dashboard-role";

export function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-10 space-y-8 animate-pulse">
      <div className="h-24 rounded-xl bg-secondary/60" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-secondary/40" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-xl bg-secondary/40" />
        <div className="h-64 rounded-xl bg-secondary/40" />
      </div>
    </div>
  );
}

export function QuickAction({
  to, label, Icon,
}: {
  to: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Button variant="outline" size="sm" className="h-auto flex-col gap-1.5 py-3 px-4" asChild>
      <Link to={to as "/admin"}>
        <Icon className="size-5 text-gold-deep" />
        <span className="text-xs">{label}</span>
      </Link>
    </Button>
  );
}

export function DashboardFrame({
  kind,
  children,
  actions,
}: {
  kind: DashboardKind;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const meta = DASHBOARD_META[kind];
  return (
    <div className="p-6 lg:p-10 space-y-8 bg-[#f4f5f7]">
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-gold/10 bg-white p-6 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-deep">
            <span className="text-lg">{meta.emoji}</span> Dashboard métier
          </span>
          <h1 className="mt-2 font-display text-3xl font-medium text-foreground md:text-4xl">{meta.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{meta.subtitle}</p>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export { StatCard } from "@/components/admin/AdminPageHeader";
