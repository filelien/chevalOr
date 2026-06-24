import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import * as fr from "@/lib/content";
import * as en from "@/lib/content-en";

/** Contenu éditorial FR ou EN selon la langue active. */
export function useSiteContent() {
  const { lang } = useI18n();
  return useMemo(() => (lang === "en" ? en : fr), [lang]);
}
