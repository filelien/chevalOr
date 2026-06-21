import { Link } from "@tanstack/react-router";

export function SectionHeader({
  label, title, subtitle, align = "left", dark = false,
}: {
  label: string; title: string; subtitle?: string; align?: "left" | "center"; dark?: boolean;
}) {
  const alignClass = align === "center" ? "text-center mx-auto" : "";
  return (
    <div className={`max-w-3xl ${alignClass}`}>
      <span className={`inline-block text-xs uppercase tracking-[0.35em] ${dark ? "text-gold" : "text-gold-deep"}`}>{label}</span>
      <h2 className={`mt-4 font-display text-4xl md:text-5xl leading-tight ${dark ? "text-white" : ""}`}>{title}</h2>
      {subtitle && <p className={`mt-4 text-base md:text-lg leading-relaxed ${dark ? "text-white/70" : "text-muted-foreground"}`}>{subtitle}</p>}
    </div>
  );
}

export function SectionDivider() {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <span className="h-px w-16 bg-gold/40" />
      <span className="size-1.5 rotate-45 bg-gold" />
      <span className="h-px w-16 bg-gold/40" />
    </div>
  );
}

export function HomeQuickNav({ items }: { items: { label: string; to: string; desc: string }[] }) {
  return (
    <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border md:grid-cols-4 lg:grid-cols-6">
      {items.map((item) => (
        <Link key={item.to} to={item.to}
          className="group flex flex-col items-center bg-card px-4 py-8 text-center transition hover:bg-gold-soft/30">
          <span className="font-display text-lg group-hover:text-gold-deep">{item.label}</span>
          <span className="mt-1 text-[11px] text-muted-foreground">{item.desc}</span>
        </Link>
      ))}
    </nav>
  );
}
