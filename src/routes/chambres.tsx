import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/layout/SiteShell";
import { fetchPublicRooms, formatXOF, ROOM_TYPE_LABEL } from "@/lib/rooms";
import { Users, Maximize2 } from "lucide-react";
import roomImg from "@/assets/room-deluxe.jpg";

export const Route = createFileRoute("/chambres")({
  head: () => ({
    meta: [
      { title: "Chambres & Suites — Hôtel Le Cheval d'Or" },
      { name: "description", content: "Découvrez nos chambres et suites élégantes : standard, supérieures, deluxe, suites et familiales." },
      { property: "og:title", content: "Chambres & Suites — Le Cheval d'Or" },
      { property: "og:description", content: "Chambres modernes, climatisées et confortables à Anié, centre du Togo." },
    ],
  }),
  errorComponent: ({ error }) => <SiteShell><div className="p-12 text-center text-destructive">{error.message}</div></SiteShell>,
  notFoundComponent: () => <SiteShell><div className="p-12 text-center">Page introuvable</div></SiteShell>,
  component: ChambresPage,
});

function ChambresPage() {
  const { data: rooms, isLoading } = useQuery({ queryKey: ["public-rooms"], queryFn: fetchPublicRooms });

  return (
    <SiteShell>
      <section className="border-b border-border/60 bg-secondary/30 py-20 text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Hébergement</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">Chambres & Suites</h1>
        <p className="mx-auto mt-4 max-w-2xl px-6 text-muted-foreground">
          Choisissez l'écrin qui vous ressemble. Chaque chambre est pensée pour le confort et l'élégance.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (rooms?.length ?? 0) === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Les chambres seront bientôt disponibles. Revenez bientôt.
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {rooms!.map((r) => {
              const cover = r.photos.find((p) => p.is_cover) ?? r.photos[0];
              return (
                <Link key={r.id} to="/chambres/$id" params={{ id: r.id }} className="group flex flex-col overflow-hidden rounded-xl bg-card shadow-elegant transition-transform hover:-translate-y-1">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img src={cover?.url ?? roomImg} alt={r.name} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-xs uppercase tracking-[0.25em] text-gold-deep">{ROOM_TYPE_LABEL[r.type]}</span>
                    <h3 className="mt-2 font-display text-2xl">{r.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="size-4" /> {r.capacity} pers.</span>
                      {r.size_sqm && <span className="flex items-center gap-1"><Maximize2 className="size-4" /> {r.size_sqm} m²</span>}
                    </div>
                    <div className="mt-auto flex items-baseline justify-between border-t border-border/60 pt-4">
                      <span className="font-display text-xl text-gold-deep">{formatXOF(r.price_per_night)}</span>
                      <span className="text-xs text-muted-foreground">/ nuit</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </SiteShell>
  );
}