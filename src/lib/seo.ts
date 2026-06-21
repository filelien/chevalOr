import { HOTEL } from "@/lib/content";

export function hotelJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: HOTEL.name,
    description: "Hôtel 5 étoiles à Lomé, Togo. Chambres de luxe, restaurant gastronomique, spa et conciergerie.",
    url: "https://chevaldor.tg",
    telephone: HOTEL.phone,
    email: HOTEL.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: HOTEL.address,
      addressLocality: "Lomé",
      addressCountry: "TG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: HOTEL.coords.lat,
      longitude: HOTEL.coords.lng,
    },
    starRating: { "@type": "Rating", ratingValue: "5" },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Piscine", value: true },
      { "@type": "LocationFeatureSpecification", name: "Restaurant", value: true },
      { "@type": "LocationFeatureSpecification", name: "Spa", value: true },
      { "@type": "LocationFeatureSpecification", name: "Wifi gratuit", value: true },
    ],
  };
}
