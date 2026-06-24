import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { getAdminDict } from "@/lib/admin-i18n";

/** Traductions admin synchronisées avec la langue du site. */
export function useAdminI18n() {
  const { lang, setLang } = useI18n();
  const ta = useMemo(() => getAdminDict(lang), [lang]);
  return { lang, setLang, ta };
}
