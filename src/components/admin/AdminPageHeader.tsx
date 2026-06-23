import type { ReactNode } from "react";

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
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {label && <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">{label}</span>}
        <h1 className="mt-2 font-display text-3xl md:text-4xl">{title}</h1>
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
}: {
  label: string;
  value: string | number;
  Icon?: React.ComponentType<{ className?: string }>;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
        {Icon && <Icon className="size-4 shrink-0 text-gold-deep" />}
      </div>
      <p className="mt-2 font-display text-2xl md:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
