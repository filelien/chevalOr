import { HOTEL } from "@/lib/content";
import { getSiteSetting, setSiteSetting } from "@/lib/site-settings";
import { fetchGalleryItems, type GalleryItem } from "@/lib/gallery-admin";
import { fetchReviews, type Review } from "@/lib/reviews-admin";

export type SocialLinks = {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  tiktok?: string;
  twitter?: string;
  youtube?: string;
};

export type HotelInfoCms = {
  name?: string;
  description?: string;
  tagline?: string;
  slogan?: string;
  address?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  social?: Partial<SocialLinks>;
  hours?: {
    checkIn?: string;
    checkOut?: string;
    restaurant?: string;
  };
  banking?: string;
};

export type SeoHomeCms = {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
};

export type GlobalContent = {
  footerTagline: string;
  reservationMessage: string;
  reservationMessageRoom: string;
  reservationMessageRestaurant: string;
  reservationMessageEvent: string;
};

export const DEFAULT_GLOBAL_CONTENT: GlobalContent = {
  footerTagline: "Un séjour de qualité, un accueil personnalisé et un cadre d'exception à Anié.",
  reservationMessage: "Bonjour, je souhaite réserver une chambre pour une date précise.",
  reservationMessageRoom: "Bonjour, je souhaite réserver la chambre Deluxe pour le prochain séjour.",
  reservationMessageRestaurant: "Bonjour, je souhaite réserver une table au restaurant.",
  reservationMessageEvent: "Bonjour, je souhaite organiser un événement au Cheval d'Or.",
};

export const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://cheval-or.vercel.app";

export function mergeHotelInfo(cms: Partial<HotelInfoCms> = {}) {
  return {
    ...HOTEL,
    ...cms,
    name: cms.name ?? HOTEL.name,
    description: cms.description ?? HOTEL.tagline,
    tagline: cms.tagline ?? HOTEL.tagline,
    slogan: cms.slogan ?? HOTEL.slogan,
    address: cms.address ?? HOTEL.address,
    phone: cms.phone ?? HOTEL.phone,
    email: cms.email ?? HOTEL.email,
    whatsapp: cms.whatsapp ?? HOTEL.whatsapp,
    social: { ...HOTEL.social, ...cms.social },
    hours: { ...HOTEL.hours, ...cms.hours },
    banking: cms.banking ?? "",
  };
}

export async function fetchHotelInfo() {
  const cms = await getSiteSetting<HotelInfoCms>("hotel_info", {});
  return mergeHotelInfo(cms);
}

export async function fetchGlobalContent() {
  const cms = await getSiteSetting<GlobalContent>("global_content", DEFAULT_GLOBAL_CONTENT);
  return { ...DEFAULT_GLOBAL_CONTENT, ...cms };
}

export async function saveGlobalContent(value: GlobalContent) {
  await setSiteSetting("global_content", value);
  return value;
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
