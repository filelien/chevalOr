import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
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
