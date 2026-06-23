import { HOTEL } from "@/lib/content";

export function hotelJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: HOTEL.name,
    description: "Hôtel à Anié, centre du Togo. Chambres climatisées, restaurant, salle de conférence et accueil 24h/24.",
    url: "https://chevaldor.tg",
    telephone: HOTEL.phone,
    email: HOTEL.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: HOTEL.address,
      addressLocality: "Anié",
      addressCountry: "TG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: HOTEL.coords.lat,
      longitude: HOTEL.coords.lng,
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
