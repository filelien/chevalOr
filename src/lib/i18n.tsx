import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Lang = "fr" | "en";

const dict = {
  fr: {
    nav: { home: "Accueil", rooms: "Chambres", book: "Réserver", restaurant: "Restaurant", gallery: "Galerie", services: "Services", experiences: "Expériences", offers: "Offres", about: "À propos", blog: "Blog", faq: "FAQ", contact: "Contact", compare: "Comparer", events: "Événements", guide: "Guide Anié" },
    cta: { book: "Réserver", bookRoom: "Réserver une chambre", bookTable: "Réserver une table", login: "Connexion", logout: "Déconnexion", mySpace: "Mon espace", dashboard: "Dashboard" },
    footer: { discover: "Découvrir", legal: "Informations légales", newsletter: "Newsletter", newsletterDesc: "Offres exclusives et inspirations voyage.", subscribe: "S'inscrire", rights: "Tous droits réservés." },
    common: { from: "À partir de", perNight: "/ nuit", loading: "Chargement…", readMore: "Lire la suite", back: "Retour" },
  },
  en: {
    nav: { home: "Home", rooms: "Rooms", book: "Book", restaurant: "Restaurant", gallery: "Gallery", services: "Services", experiences: "Experiences", offers: "Offers", about: "About", blog: "Blog", faq: "FAQ", contact: "Contact", compare: "Compare", events: "Events", guide: "Anié Guide" },
    cta: { book: "Book", bookRoom: "Book a room", bookTable: "Book a table", login: "Sign in", logout: "Sign out", mySpace: "My account", dashboard: "Dashboard" },
    footer: { discover: "Discover", legal: "Legal", newsletter: "Newsletter", newsletterDesc: "Exclusive offers and travel inspiration.", subscribe: "Subscribe", rights: "All rights reserved." },
    common: { from: "From", perNight: "/ night", loading: "Loading…", readMore: "Read more", back: "Back" },
  },
} as const;

type Dict = typeof dict.fr;

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
