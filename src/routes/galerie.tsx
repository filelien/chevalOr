import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import hero from "@/assets/hero.jpg";
import roomImg from "@/assets/room-deluxe.jpg";
import restaurantImg from "@/assets/restaurant.jpg";

export const Route = createFileRoute("/galerie")({
  head: () => ({ meta: [
    { title: "Galerie — Hôtel Le Cheval d'Or" },
    { name: "description", content: "Découvrez l'hôtel en images : chambres, restaurant, piscine, jardin." },
  ] }),
  component: () => (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Galerie</span>
          <h1 className="mt-3 font-display text-5xl">L'hôtel en images</h1>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
          {[hero, roomImg, restaurantImg, hero, roomImg, restaurantImg].map((src, i) => (
            <div key={i} className="overflow-hidden rounded-lg bg-muted">
              <img src={src} alt="" className="aspect-square size-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  ),
});