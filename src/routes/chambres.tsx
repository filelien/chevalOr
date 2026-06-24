import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/layout/SiteShell";
import { fetchPublicRooms, formatXOF } from "@/lib/rooms";
import { useI18n, roomTypeLabel } from "@/lib/i18n";
import { Users, Maximize2 } from "lucide-react";
import roomImg from "@/assets/room-deluxe.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/chambres")({
  head: () => ({
    meta: [
      { title: "Chambres & Suites — Hôtel Le Cheval d'Or" },
      { name: "description", content: "Chambres modernes, climatisées et confortables à Anié, Togo." },
    ],
  }),
  component: ChambresPage,
});

function ChambresPage() {
  const { t, lang } = useI18n();
  const p = t.pages.rooms;
  const { data: rooms, isLoading } = useQuery({ queryKey: ["public-rooms"], queryFn: fetchPublicRooms });

  return (
    <SiteShell>
      <section className="border-b border-border/60 bg-gradient-to-b from-secondary/40 to-background py-20 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">{p.label}</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">{p.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl px-6 text-muted-foreground">{p.subtitle}</p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : (rooms?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            {t.common.soon}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {rooms!.map((r) => {
              const cover = r.photos.find((p) => p.is_cover) ?? r.photos[0];
              return (
                <article key={r.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-elegant">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={cover?.url ?? roomImg} alt={r.name} className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                  </div>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-wider text-gold-deep">{roomTypeLabel(r.type, lang)}</p>
                    <h2 className="mt-1 font-display text-2xl">{r.name}</h2>
                    <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="size-4" />{r.capacity} {t.common.guests}</span>
                      <span className="flex items-center gap-1"><Maximize2 className="size-4" />{r.size_sqm} m²</span>
                    </div>
                    <p className="mt-4 font-display text-xl text-gold-deep">
                      {t.common.from} {formatXOF(r.base_price)}<span className="text-sm text-muted-foreground">{t.common.perNight}</span>
                    </p>
                    <Button variant="hero" className="mt-4 w-full" asChild>
                      <Link to="/chambres/$id" params={{ id: r.id }}>{t.common.details}</Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
