import type { ReactNode } from "react";

export function PageHero({ image, label, title, subtitle, children }: {
  image: string; label?: string; title: string; subtitle?: string; children?: ReactNode;
}) {
  return (
    <section className="relative h-[50vh] min-h-[380px] overflow-hidden">
      <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center text-white">
        {label && <span className="text-xs uppercase tracking-[0.3em] text-gold">{label}</span>}
        <h1 className="mt-3 font-display text-4xl md:text-6xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-white/85">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
