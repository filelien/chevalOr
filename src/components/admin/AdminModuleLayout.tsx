import type { ReactNode } from "react";
import { StatCard } from "@/components/admin/AdminPageHeader";

export type ModuleStat = {
  label: string;
  value: string | number;
  Icon?: React.ComponentType<{ className?: string }>;
  accent?: boolean;
  hint?: string;
};

type Props = {
  label: string;
  title: string;
  subtitle?: string;
  stats?: ModuleStat[];
  actions?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
};

/** En-tête unifié pour les modules admin (Gestion hôtelière, Exploitation, Finances…). */
export function AdminModuleLayout({ label, title, subtitle, stats, actions, toolbar, children }: Props) {
  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">{label}</span>
          <h1 className="mt-2 font-display text-3xl md:text-4xl text-foreground">{title}</h1>
          {subtitle && <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div className={`grid gap-4 ${stats.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : `sm:grid-cols-${stats.length}`}`}>
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      {toolbar && <div className="flex flex-wrap items-center gap-3">{toolbar}</div>}

      {children}
    </div>
  );
}

export function AdminChartCard({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-6 shadow-sm ${className}`}>
      <h2 className="font-display text-xl text-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function AdminDataTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
