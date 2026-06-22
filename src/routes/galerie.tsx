import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
<<<<<<< HEAD
import { PageHero } from "@/components/site/PageHero";
import { LightboxGallery } from "@/components/site/LightboxGallery";
import { GALLERY_IMAGES } from "@/lib/content";
import hero from "@/assets/hero.jpg";
import restaurantImg from "@/assets/restaurant.jpg";
import roomImg from "@/assets/room-deluxe.jpg";

const srcMap: Record<string, string> = { hero, restaurant: restaurantImg, room: roomImg };

export const Route = createFileRoute("/galerie")({
  head: () => ({ meta: [{ title: "Galerie — Cheval d'Or" }] }),
  component: () => {
    const images = GALLERY_IMAGES.map((g) => ({ src: srcMap[g.src], alt: g.alt }));
    return (
      <SiteShell>
        <PageHero image={hero} label="Galerie" title="Visite immersive" subtitle="Découvrez nos espaces en images — zoom & navigation fluide." />
        <section className="mx-auto max-w-7xl px-6 py-16">
          <LightboxGallery images={images} />
        </section>
      </SiteShell>
    );
  },
});
=======
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
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
