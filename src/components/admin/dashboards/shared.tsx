import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AdminPageHeader, StatCard } from "@/components/admin/AdminPageHeader";
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
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label={`${meta.emoji} Dashboard métier`}
        title={meta.title}
        subtitle={meta.subtitle}
      >
        {actions}
      </AdminPageHeader>
      {children}
    </div>
  );
}

export { StatCard };
