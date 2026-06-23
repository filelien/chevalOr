import { HOTEL } from "@/lib/content";
import { getSiteSetting } from "@/lib/site-settings";
import { fetchGalleryItems, type GalleryItem } from "@/lib/gallery-admin";
import { fetchReviews, type Review } from "@/lib/reviews-admin";

export type HotelInfoCms = {
  tagline?: string;
  slogan?: string;
  address?: string;
  phone?: string;
  email?: string;
};

export type SeoHomeCms = {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
};

export const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://cheval-or.vercel.app";

export async function fetchHotelInfo() {
  const cms = await getSiteSetting<HotelInfoCms>("hotel_info", {});
  return {
    ...HOTEL,
    tagline: cms.tagline ?? HOTEL.tagline,
    slogan: cms.slogan ?? HOTEL.slogan,
    address: cms.address ?? HOTEL.address,
    phone: cms.phone ?? HOTEL.phone,
    email: cms.email ?? HOTEL.email,
  };
}

export async function fetchSeoHome() {
  const cms = await getSiteSetting<SeoHomeCms>("seo_home", {});
  return {
    title: cms.title ?? "Hôtel Le Cheval d'Or — Votre référence à Anié, Togo",
    description:
      cms.description ??
      "Hôtel à Anié, centre du Togo : chambres climatisées, restaurant, salle de conférence, parking sécurisé.",
    keywords: cms.keywords ?? "hôtel Anié, Togo, conférence, séminaire",
    ogImage: cms.ogImage ?? `${SITE_URL}/assets/hero.jpg`,
  };
}

export async function fetchPublicGallery(): Promise<GalleryItem[]> {
  try {
    const items = await fetchGalleryItems(false);
    return items.length ? items : [];
  } catch {
    return [];
  }
}

export type PublicReview = {
  id: string;
  name: string;
  quote: string;
  stars: number;
  role?: string;
};

export async function fetchPublicReviews(): Promise<PublicReview[]> {
  try {
    const rows = await fetchReviews(false);
    if (!rows.length) return [];
    return rows.map((r: Review) => ({
      id: r.id,
      name: r.author_name,
      quote: r.comment,
      stars: r.rating,
      role: r.author_email ? undefined : "Client",
    }));
  } catch {
    return [];
  }
}

export function galleryToLightbox(items: GalleryItem[]) {
  return items.map((g) => ({ src: g.url, alt: g.title, cat: g.category }));
}
