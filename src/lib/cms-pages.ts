import { getSiteSetting, setSiteSetting } from "@/lib/site-settings";

export type CmsPageSection = {
  id: string;
  type: "hero" | "text" | "features" | "cta";
  title: string;
  body: string;
  image?: string;
};

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  path: string;
  description: string;
  published: boolean;
  sections: CmsPageSection[];
  updated_at?: string;
};

const DEFAULT_PAGES: CmsPage[] = [
  {
    id: "home",
    slug: "accueil",
    title: "Accueil",
    path: "/",
    description: "Page d'accueil — hero, offres, galerie",
    published: true,
    sections: [
      { id: "h1", type: "hero", title: "Bienvenue au Cheval d'Or", body: "Luxe & hospitalité à Anié", image: "" },
    ],
  },
  {
    id: "about",
    slug: "a-propos",
    title: "À propos",
    path: "/a-propos",
    description: "Histoire et valeurs de l'établissement",
    published: true,
    sections: [
      { id: "t1", type: "text", title: "Notre histoire", body: "Depuis plus de vingt ans, l'Hôtel Le Cheval d'Or accueille voyageurs et professionnels au cœur d'Anié." },
    ],
  },
  {
    id: "services",
    slug: "services",
    title: "Services",
    path: "/services",
    description: "Services hôteliers et conciergerie",
    published: true,
    sections: [],
  },
  {
    id: "restaurant",
    slug: "restaurant",
    title: "Restaurant",
    path: "/restaurant",
    description: "Gastronomie et réservation de table",
    published: true,
    sections: [],
  },
  {
    id: "guide",
    slug: "guide",
    title: "Guide Anié",
    path: "/guide",
    description: "Découvertes locales et activités",
    published: true,
    sections: [],
  },
  {
    id: "faq",
    slug: "faq",
    title: "FAQ",
    path: "/faq",
    description: "Questions fréquentes",
    published: true,
    sections: [],
  },
];

export async function fetchCmsPages(): Promise<CmsPage[]> {
  const data = await getSiteSetting<CmsPage[]>("cms_pages", DEFAULT_PAGES);
  return data.length ? data : DEFAULT_PAGES;
}

export async function saveCmsPages(pages: CmsPage[]) {
  const stamped = pages.map((p) => ({ ...p, updated_at: new Date().toISOString() }));
  await setSiteSetting("cms_pages", stamped);
  return stamped;
}

export async function upsertCmsPage(page: CmsPage) {
  const pages = await fetchCmsPages();
  const idx = pages.findIndex((p) => p.id === page.id);
  const next = [...pages];
  if (idx >= 0) next[idx] = { ...page, updated_at: new Date().toISOString() };
  else next.push({ ...page, updated_at: new Date().toISOString() });
  await saveCmsPages(next);
}

export async function deleteCmsPage(id: string) {
  const pages = await fetchCmsPages();
  await saveCmsPages(pages.filter((p) => p.id !== id));
}

export type AppAppearance = {
  fontScale: "small" | "normal" | "large" | "xlarge";
  theme: "light" | "dark" | "auto";
  accent: "gold" | "emerald" | "blue" | "violet";
};

export const DEFAULT_APPEARANCE: AppAppearance = {
  fontScale: "normal",
  theme: "light",
  accent: "gold",
};

export async function getAppearance(): Promise<AppAppearance> {
  return getSiteSetting("app_appearance", DEFAULT_APPEARANCE);
}

export async function setAppearance(v: AppAppearance) {
  await setSiteSetting("app_appearance", v);
  if (typeof document !== "undefined") {
    applyAppearance(v);
  }
}

export function applyAppearance(v: AppAppearance) {
  const root = document.documentElement;
  const scales = { small: "14px", normal: "16px", large: "17.6px", xlarge: "19.2px" };
  root.style.fontSize = scales[v.fontScale];
  root.classList.toggle("dark", v.theme === "dark");
  root.dataset.accent = v.accent;
}
