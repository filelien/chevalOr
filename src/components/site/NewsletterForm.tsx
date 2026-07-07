import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function NewsletterForm({ compact, buttonText, tone = "dark" }: { compact?: boolean; buttonText?: string; tone?: "light" | "dark" }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { toast.error("Email invalide"); return; }
    setBusy(true);
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim().toLowerCase() });
      if (error?.code === "23505") toast.success("Vous êtes déjà inscrit(e) !");
      else if (error) throw error;
      else toast.success("Inscription confirmée !");
      setEmail("");
    } catch (err: any) {
      toast.error(err.message ?? "Erreur");
    } finally { setBusy(false); }
  }

  const styles = useMemo(() => {
    if (tone === "light") {
      return {
        desc: "text-sm text-muted-foreground",
        input:
          "flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70",
      };
    }
    return {
      desc: "text-sm text-white/60",
      input:
        "flex-1 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40",
    };
  }, [tone]);

  return (
    <form onSubmit={submit} className={compact ? "flex gap-2" : "space-y-3"}>
      {!compact && <p className={styles.desc}>{t.footer.newsletterDesc}</p>}
      <div className={compact ? "flex flex-1 gap-2" : "flex flex-col gap-2 sm:flex-row"}>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="email@exemple.com"
          className={styles.input}
        />
        <Button type="submit" variant="hero" size="sm" className={tone === "light" ? "min-w-[140px]" : ""} disabled={busy}>{busy ? "…" : (buttonText || t.footer.subscribe)}</Button>
      </div>
    </form>
  );
}
