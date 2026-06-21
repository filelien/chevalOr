import { useI18n, type Lang } from "@/lib/i18n";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const toggle = () => setLang(lang === "fr" ? "en" : "fr");
  return (
    <button onClick={toggle} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs uppercase tracking-wider text-foreground/70 hover:text-gold-deep" aria-label="Changer de langue">
      <Globe className="size-4" /> {lang === "fr" ? "EN" : "FR"}
    </button>
  );
}

export function LanguageSwitcherFooter() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex gap-2 text-sm">
      {(["fr", "en"] as Lang[]).map((l) => (
        <button key={l} onClick={() => setLang(l)}
          className={`uppercase ${lang === l ? "text-gold" : "text-white/50 hover:text-white"}`}>{l}</button>
      ))}
    </div>
  );
}
