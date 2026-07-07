/**
 * Hotel Configuration System
 * Récupère toute la configuration depuis la base de données ou les variables d'environnement.
 * Remplace les valeurs codées en dur par un système centralisé et dynamique.
 */

import { supabase } from "@/integrations/supabase/client";

export type HotelConfig = {
  name: string;
  tagline: string;
  slogan: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  whatsapp: string;
  hours: string;
  currency: string;
  timezone: string;
  language: string;
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  logo_url?: string;
  favicon_url?: string;
  banner_url?: string;
  theme_color: string;
  secondary_color: string;
  accent_color: string;
};

const DEFAULT_CONFIG: HotelConfig = {
  name: "Hôtel Le Cheval d'Or",
  tagline: "Votre référence en hospitalité",
  slogan: "Luxe & hospitalité",
  address: "BP 12345, Anié",
  city: "Anié",
  country: "Togo",
  phone: "+228 22 000 000",
  email: "contact@chevaldor.tg",
  whatsapp: "+228 90 000 000",
  hours: "00:00 - 23:59",
  currency: "XOF",
  timezone: "Africa/Lagos",
  language: "fr",
  social: {
    facebook: "https://facebook.com/chevaldor",
    instagram: "https://instagram.com/chevaldor",
  },
  theme_color: "#C9A227",
  secondary_color: "#1a1d24",
  accent_color: "#60a5fa",
};

let cachedConfig: HotelConfig | null = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère la configuration hôtel depuis la DB
 */
export async function fetchHotelConfig(forceRefresh = false): Promise<HotelConfig> {
  const now = Date.now();
  if (cachedConfig && !forceRefresh && now - cacheTime < CACHE_DURATION) {
    return cachedConfig;
  }

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "hotel_config")
      .single();

    if (error || !data) {
      console.warn("[hotel-config] Utilisation de la config par défaut", error?.message);
      cachedConfig = DEFAULT_CONFIG;
    } else {
      const parsed = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
      cachedConfig = { ...DEFAULT_CONFIG, ...parsed };
    }
    cacheTime = now;
    return cachedConfig;
  } catch (err) {
    console.error("[hotel-config] Erreur:", err);
    cachedConfig = DEFAULT_CONFIG;
    return cachedConfig;
  }
}

/**
 * Enregistre la configuration hôtel dans la DB
 */
export async function saveHotelConfig(config: Partial<HotelConfig>): Promise<void> {
  try {
    const merged = { ...DEFAULT_CONFIG, ...cachedConfig, ...config };
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "hotel_config", value: merged }, { onConflict: "key" });

    if (error) throw error;
    cachedConfig = merged;
    cacheTime = Date.now();
  } catch (err) {
    console.error("[hotel-config] Erreur save:", err);
    throw err;
  }
}

/**
 * Getters pratiques pour accéder à la config
 */
export async function getHotelInfo() {
  const config = await fetchHotelConfig();
  return {
    name: config.name,
    email: config.email,
    phone: config.phone,
    address: config.address,
  };
}

export async function getHotelContact() {
  const config = await fetchHotelConfig();
  return {
    phone: config.phone,
    email: config.email,
    whatsapp: config.whatsapp,
    address: config.address,
    hours: config.hours,
  };
}

export async function getHotelBranding() {
  const config = await fetchHotelConfig();
  return {
    name: config.name,
    logo_url: config.logo_url,
    favicon_url: config.favicon_url,
    theme_color: config.theme_color,
    secondary_color: config.secondary_color,
    accent_color: config.accent_color,
  };
}

/**
 * Met à jour le cache (appeler après modification de config via le Dashboard)
 */
export function invalidateHotelConfigCache() {
  cachedConfig = null;
  cacheTime = 0;
}
