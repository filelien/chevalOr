import { HOTEL } from "@/lib/content";
import type { SeoHomeCms } from "@/lib/cms";
import { SITE_URL } from "@/lib/cms";
import logo from "@/assets/logo.png";
import hero from "@/assets/hero.jpg";

export function hotelJsonLd(hotel: typeof HOTEL = HOTEL) {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    description: hotel.tagline,
    url: SITE_URL,
    telephone: hotel.phone,
    email: hotel.email,
    image: `${SITE_URL}${hero}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: hotel.address,
      addressLocality: "Anié",
      addressCountry: "TG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: hotel.coords.lat,
      longitude: hotel.coords.lng,
    },
    starRating: { "@type": "Rating", ratingValue: "5" },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Salle de conférence", value: true },
      { "@type": "LocationFeatureSpecification", name: "Restaurant", value: true },
      { "@type": "LocationFeatureSpecification", name: "Parking sécurisé", value: true },
      { "@type": "LocationFeatureSpecification", name: "Wifi gratuit", value: true },
    ],
  };
}

export function buildPageMeta(opts: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: string;
}) {
  const url = opts.path ? `${SITE_URL}${opts.path}` : SITE_URL;
  const image = opts.image ?? `${SITE_URL}${hero}`;
  return [
    { title: opts.title },
    { name: "description", content: opts.description },
    { name: "robots", content: "index, follow" },
    { tag: "link", rel: "canonical", href: url },
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { property: "og:type", content: opts.type ?? "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:site_name", content: HOTEL.name },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: opts.description },
    { name: "twitter:image", content: image },
  ];
}

export function homeMetaFromCms(seo: SeoHomeCms & { title: string; description: string; ogImage: string }) {
  return buildPageMeta({
    title: seo.title,
    description: seo.description,
    path: "/",
    image: seo.ogImage,
  });
}

export const DEFAULT_OG_IMAGE = hero;
export const SITE_LOGO = logo;

export const PUBLIC_ROUTES = [
  "/",
  "/a-propos",
  "/chambres",
  "/comparer",
  "/contact",
  "/evenements",
  "/experiences",
  "/faq",
  "/galerie",
  "/guide",
  "/offres",
  "/reserver",
  "/restaurant",
  "/services",
  "/blog",
  "/cgv",
  "/confidentialite",
  "/mentions-legales",
  "/auth",
];

export function buildSitemapXml() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = PUBLIC_ROUTES.map(
    (path) => `  <url><loc>${SITE_URL}${path === "/" ? "" : path}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq></url>`,
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export function buildRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}
