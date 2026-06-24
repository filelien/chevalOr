import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { LightboxGallery } from "@/components/site/LightboxGallery";
import { fetchPublicGallery, galleryToLightbox } from "@/lib/cms";
import { useSiteContent } from "@/hooks/use-site-content";
import { useI18n } from "@/lib/i18n";
import { buildPageMeta } from "@/lib/seo";
import hero from "@/assets/hero.jpg";
import restaurantImg from "@/assets/restaurant.jpg";
import roomImg from "@/assets/room-deluxe.jpg";

const fallbackSrc: Record<string, string> = { hero, restaurant: restaurantImg, room: roomImg };

export const Route = createFileRoute("/galerie")({
  head: () => ({
    meta: buildPageMeta({
      title: "Galerie — Hôtel Le Cheval d'Or, Anié",
      description: "Découvrez nos chambres, restaurant et salle de conférence en images.",
      path: "/galerie",
    }),
  }),
  component: GaleriePage,
});

function GaleriePage() {
  const { GALLERY_IMAGES } = useSiteContent();
  const { t } = useI18n();
  const u = t.ui.gallery;
  const { data: items, isLoading } = useQuery({ queryKey: ["public-gallery"], queryFn: fetchPublicGallery });

  const images = items?.length
    ? galleryToLightbox(items)
    : GALLERY_IMAGES.map((g) => ({ src: fallbackSrc[g.src], alt: g.alt }));

  return (
    <SiteShell>
      <PageHero image={hero} label={t.pages.gallery.label} title={u.immersive} subtitle={u.subtitle} />
      <section className="mx-auto max-w-7xl px-6 py-16">
        {isLoading ? (
          <p className="text-center text-muted-foreground">{u.loading}</p>
        ) : (
          <LightboxGallery images={images} />
        )}
      </section>
    </SiteShell>
  );
}
