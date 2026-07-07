import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Lang = "fr" | "en";

const dict = {
  fr: {
    nav: { home: "Accueil", rooms: "Chambres", book: "Réserver", restaurant: "Restaurant", gallery: "Galerie", services: "Services", experiences: "Expériences", offers: "Offres", about: "À propos", blog: "Blog", faq: "FAQ", contact: "Contact", compare: "Comparer", events: "Événements", guide: "Guide Anié", more: "Plus" },
    cta: { book: "Réserver", bookRoom: "Réserver une chambre", bookTable: "Réserver une table", login: "Connexion", logout: "Déconnexion", mySpace: "Mon espace", dashboard: "Dashboard", viewRooms: "Voir les chambres", send: "Envoyer", submit: "Envoyer le message" },
    footer: {
      discover: "Découvrir", legal: "Informations légales", newsletter: "Newsletter", newsletterDesc: "Offres exclusives et inspirations voyage.", subscribe: "S'inscrire", rights: "Tous droits réservés.",
      tagline: "Une adresse d'exception au cœur du Togo. Hospitalité ouest-africaine authentique.",
      roomsSuites: "Chambres & suites", specialOffers: "Offres spéciales", legalNotice: "Mentions légales", terms: "CGV", privacy: "Confidentialité", contactTitle: "Contact",
    },
    common: { from: "À partir de", perNight: "/ nuit", loading: "Chargement…", readMore: "Lire la suite", back: "Retour", details: "Détails", night: "nuit", guests: "personnes", noResults: "Aucun résultat", soon: "Bientôt disponible" },
    pages: {
      rooms: { label: "Hébergement", title: "Chambres & Suites", subtitle: "Choisissez l'écrin qui vous ressemble. Confort et élégance à chaque séjour." },
      contact: { label: "Contact", title: "Conciergerie 24h/24", subtitle: "Notre équipe est à votre écoute pour toute demande.", writeUs: "Nous écrire", coords: "Coordonnées", name: "Nom", email: "Email", phone: "Téléphone", subject: "Sujet", message: "Message", success: "Message envoyé ! Réponse sous 24h." },
      faq: { label: "Aide", title: "Questions fréquentes", subtitle: "Tout ce qu'il faut savoir avant votre séjour." },
      about: { label: "Notre histoire", title: "À propos de nous" },
      services: { label: "Équipements", title: "Services & prestations", subtitle: "Tout pour un séjour confortable et productif." },
      offers: { label: "Offres", title: "Offres & forfaits", subtitle: "Promotions et packages pour chaque type de séjour." },
      experiences: { label: "Découvertes", title: "Expériences", subtitle: "Activités et découvertes autour d'Anié." },
      events: { label: "Événements", title: "Événements & conférence" },
      gallery: { label: "Galerie", title: "Galerie photos" },
      guide: { label: "Destination", title: "Guide Anié" },
      restaurant: { label: "Gastronomie", title: "Restaurant" },
      book: { label: "Réservation", title: "Réserver votre séjour" },
      compare: { label: "Comparer", title: "Comparer les chambres" },
      blog: { label: "Magazine", title: "Blog & actualités" },
      legal: { mentions: "Mentions légales", terms: "Conditions générales", privacy: "Politique de confidentialité" },
    },
    roomTypes: { standard: "Standard", superior: "Supérieure", deluxe: "Deluxe", suite: "Suite", family: "Familiale" },
    home: {
      presentation: "Présentation", hotelRef: "Votre hôtel de référence à Anié", since: "Depuis", bookNow: "Réserver maintenant",
      discoverRooms: "Découvrir nos chambres", loyalty: "Programme fidélité", loyaltySubtitle: "Gagnez des avantages à chaque séjour — restauration, upgrades, spa.",
      faqTeaser: "Questions fréquentes", allFaq: "Voir toute la FAQ", viewAll: "Voir tout",
    },
    ui: {
      offers: { promoTitle: "Codes promo", promoEmpty: "Aucune promotion active pour le moment. Consultez-nous pour une offre sur mesure.", loading: "Chargement des offres…", validUntil: "Valable jusqu'au", useCode: "Utiliser ce code", discountOn: "sur votre séjour", packsTitle: "Packs séjour", bookPack: "Réserver ce pack", subtitle: "Des formules exclusives pour chaque type de voyage.", title: "Promotions & packs séjour" },
      restaurant: { menuTab: "La carte", reserveTab: "Réserver une table", openHours: "Ouvert 19h – 23h · Tenue élégante souhaitée", loadingMenu: "Chargement de la carte…", subtitle: "Gastronomie française & saveurs togolaises — inspiration Mandarin Oriental." },
      gallery: { immersive: "Visite immersive", subtitle: "Découvrez nos espaces en images — zoom & navigation fluide.", loading: "Chargement de la galerie…" },
      experiences: { subtitle: "Inspiré de Six Senses et Belmond — découvrez le Togo autrement.", title: "Moments inoubliables", book: "Réserver l'expérience" },
      guide: { tourism: "Tourisme", title: "Découvrir Anié & la région centrale", subtitle: "Traditions, hospitalité et patrimoine au cœur du Togo.", intro: "est une ville paisible au centre du Togo, idéale pour découvrir l'authenticité togolaise tout en restant connecté aux principales villes du pays.", map: "Carte", openMaps: "Ouvrir Google Maps", fromHotel: "de l'hôtel" },
      blog: { inspirations: "Inspirations & actualités" },
      compare: { selectRooms: "Sélectionnez les chambres à comparer", criterion: "Critère", type: "Type", capacity: "Capacité", size: "Surface", price: "Prix / nuit", amenities: "Équipements", persons: "pers.", book: "Réserver", subtitle: "Comparez jusqu'à 3 chambres côte à côte." },
      book: { allTypes: "Tout type", checkIn: "Arrivée", checkOut: "Départ", guests: "Voyageurs", roomType: "Type de chambre", specialRequests: "Demandes spéciales", findRoom: "Trouver une chambre", confirm: "Confirmer la réservation", promoCode: "Code promo", apply: "Appliquer", total: "Total", nights: "nuits", subtitle: "Réservez en quelques clics — nous attribuons la chambre disponible la plus adaptée.", title: "Réserver votre séjour", loginHint: "Connectez-vous pour suivre vos réservations." },
      auth: { login: "Connexion", signup: "Créer un compte", welcome: "Bienvenue !", accountCreated: "Compte créé. Vous êtes connecté.", email: "Email", password: "Mot de passe", fullName: "Nom complet", phone: "Téléphone", haveAccount: "Déjà un compte ?", noAccount: "Pas encore de compte ?", signIn: "Se connecter", register: "S'inscrire", title: "Espace client" },
      room: { notFound: "Chambre introuvable", loading: "Chargement…", amenities: "Équipements", book: "Réserver cette chambre", checkAvail: "Vérifier disponibilité", available: "Disponible", unavailable: "Non disponible", perNight: "/ nuit", capacity: "Capacité", size: "Surface" },
      about: { presentation: "Présentation" },
      legal: { lastUpdate: "Dernière mise à jour" },
      myReservations: { title: "Mes réservations", empty: "Aucune réservation pour le moment.", loginRequired: "Connectez-vous pour voir vos réservations." },
    },
  },
  en: {
    nav: { home: "Home", rooms: "Rooms", book: "Book", restaurant: "Restaurant", gallery: "Gallery", services: "Services", experiences: "Experiences", offers: "Offers", about: "About", blog: "Blog", faq: "FAQ", contact: "Contact", compare: "Compare", events: "Events", guide: "Anié Guide", more: "More" },
    cta: { book: "Book", bookRoom: "Book a room", bookTable: "Book a table", login: "Sign in", logout: "Sign out", mySpace: "My account", dashboard: "Dashboard", viewRooms: "View rooms", send: "Send", submit: "Send message" },
    footer: {
      discover: "Discover", legal: "Legal", newsletter: "Newsletter", newsletterDesc: "Exclusive offers and travel inspiration.", subscribe: "Subscribe", rights: "All rights reserved.",
      tagline: "An exceptional address in the heart of Togo. Authentic West African hospitality.",
      roomsSuites: "Rooms & suites", specialOffers: "Special offers", legalNotice: "Legal notice", terms: "Terms & conditions", privacy: "Privacy policy", contactTitle: "Contact",
    },
    common: { from: "From", perNight: "/ night", loading: "Loading…", readMore: "Read more", back: "Back", details: "Details", night: "night", guests: "guests", noResults: "No results", soon: "Coming soon" },
    pages: {
      rooms: { label: "Accommodation", title: "Rooms & Suites", subtitle: "Choose the setting that suits you. Comfort and elegance for every stay." },
      contact: { label: "Contact", title: "24/7 Concierge", subtitle: "Our team is here for any request.", writeUs: "Write to us", coords: "Contact details", name: "Name", email: "Email", phone: "Phone", subject: "Subject", message: "Message", success: "Message sent! We reply within 24 hours." },
      faq: { label: "Help", title: "Frequently asked questions", subtitle: "Everything you need to know before your stay." },
      about: { label: "Our story", title: "About us" },
      services: { label: "Amenities", title: "Services & facilities", subtitle: "Everything for a comfortable and productive stay." },
      offers: { label: "Offers", title: "Offers & packages", subtitle: "Promotions and packages for every type of stay." },
      experiences: { label: "Discover", title: "Experiences", subtitle: "Activities and discoveries around Anié." },
      events: { label: "Events", title: "Events & conference" },
      gallery: { label: "Gallery", title: "Photo gallery" },
      guide: { label: "Destination", title: "Anié Guide" },
      restaurant: { label: "Dining", title: "Restaurant" },
      book: { label: "Booking", title: "Book your stay" },
      compare: { label: "Compare", title: "Compare rooms" },
      blog: { label: "Magazine", title: "Blog & news" },
      legal: { mentions: "Legal notice", terms: "Terms & conditions", privacy: "Privacy policy" },
    },
    roomTypes: { standard: "Standard", superior: "Superior", deluxe: "Deluxe", suite: "Suite", family: "Family" },
    home: {
      presentation: "About us", hotelRef: "Your hotel reference in Anié", since: "Since", bookNow: "Book now",
      discoverRooms: "Discover our rooms", loyalty: "Loyalty programme", loyaltySubtitle: "Earn perks every stay — dining, upgrades, spa.",
      faqTeaser: "Frequently asked questions", allFaq: "View all FAQ", viewAll: "View all",
    },
    ui: {
      offers: { promoTitle: "Promo codes", promoEmpty: "No active promotions at the moment. Contact us for a tailored offer.", loading: "Loading offers…", validUntil: "Valid until", useCode: "Use this code", discountOn: "off your stay", packsTitle: "Stay packages", bookPack: "Book this package", subtitle: "Exclusive packages for every type of trip.", title: "Promotions & stay packages" },
      restaurant: { menuTab: "Menu", reserveTab: "Book a table", openHours: "Open 7 PM – 11 PM · Smart casual dress code", loadingMenu: "Loading menu…", subtitle: "French gastronomy & Togolese flavours — Mandarin Oriental inspired." },
      gallery: { immersive: "Immersive tour", subtitle: "Explore our spaces in images — zoom & smooth navigation.", loading: "Loading gallery…" },
      experiences: { subtitle: "Inspired by Six Senses and Belmond — discover Togo differently.", title: "Unforgettable moments", book: "Book experience" },
      guide: { tourism: "Tourism", title: "Discover Anié & the central region", subtitle: "Traditions, hospitality and heritage in the heart of Togo.", intro: "is a peaceful city in central Togo, ideal to discover authentic Togo while staying connected to major towns.", map: "Map", openMaps: "Open Google Maps", fromHotel: "from the hotel" },
      blog: { inspirations: "Inspiration & news" },
      compare: { selectRooms: "Select rooms to compare", criterion: "Criterion", type: "Type", capacity: "Capacity", size: "Size", price: "Price / night", amenities: "Amenities", persons: "guests", book: "Book", subtitle: "Compare up to 3 rooms side by side." },
      book: { allTypes: "All types", checkIn: "Check-in", checkOut: "Check-out", guests: "Guests", roomType: "Room type", specialRequests: "Special requests", findRoom: "Find a room", confirm: "Confirm booking", promoCode: "Promo code", apply: "Apply", total: "Total", nights: "nights", subtitle: "Book in a few clicks — we assign the best available room.", title: "Book your stay", loginHint: "Sign in to track your bookings." },
      auth: { login: "Sign in", signup: "Create account", welcome: "Welcome!", accountCreated: "Account created. You are signed in.", email: "Email", password: "Password", fullName: "Full name", phone: "Phone", haveAccount: "Already have an account?", noAccount: "Don't have an account yet?", signIn: "Sign in", register: "Register", title: "Guest account" },
      room: { notFound: "Room not found", loading: "Loading…", amenities: "Amenities", book: "Book this room", checkAvail: "Check availability", available: "Available", unavailable: "Not available", perNight: "/ night", capacity: "Capacity", size: "Size" },
      about: { presentation: "About" },
      legal: { lastUpdate: "Last updated" },
      myReservations: { title: "My bookings", empty: "No bookings yet.", loginRequired: "Sign in to view your bookings." },
    },
  },
} as const;

export type Dict = typeof dict.fr;

const I18nCtx = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void } | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "fr";
    return (localStorage.getItem("cheval-lang") as Lang) || "fr";
  });
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("cheval-lang", l);
    document.documentElement.lang = l;
  }, []);
  return (
    <I18nCtx.Provider value={{ lang, t: dict[lang], setLang }}>
      {children}
    </I18nCtx.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Libellé type de chambre bilingue */
export function roomTypeLabel(type: string, lang: Lang): string {
  const key = type as keyof Dict["roomTypes"];
  return dict[lang].roomTypes[key] ?? type;
}
