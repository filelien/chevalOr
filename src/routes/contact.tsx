import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import hero from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { notifyContactMessage } from "@/lib/email.server";
import { useHotelCms } from "@/hooks/use-hotel-cms";
import { useI18n } from "@/lib/i18n";
import { buildPageMeta } from "@/lib/seo";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: buildPageMeta({
      title: "Contact — Hôtel Le Cheval d'Or",
      description: "Conciergerie 24h/24 à Anié. Réservation, restaurant, événements.",
      path: "/contact",
    }),
  }),
  component: ContactPage,
});

function ContactPage() {
  const { hotel } = useHotelCms();
  const { t } = useI18n();
  const p = t.pages.contact;
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "Réservation", message: "" });
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        full_name: form.name, email: form.email, phone: form.phone || null,
        subject: form.subject, message: form.message,
      });
      if (error) throw error;
      void notifyContactMessage({
        fullName: form.name, email: form.email, phone: form.phone || undefined,
        subject: form.subject, message: form.message,
      });
      toast.success(p.success);
      setForm({ name: "", email: "", phone: "", subject: "Réservation", message: "" });
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  }

  return (
    <SiteShell>
      <PageHero image={hero} label={p.label} title={p.title} subtitle={p.subtitle} />
      <section className="mx-auto max-w-7xl px-6 py-16 grid gap-12 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
          <h2 className="font-display text-2xl">{p.writeUs}</h2>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {[
              { k: "name", l: p.name, t: "text" },
              { k: "email", l: p.email, t: "email" },
              { k: "phone", l: p.phone, t: "tel" },
            ].map(({ k, l, t: type }) => (
              <label key={k} className="block text-sm">
                <span className="text-muted-foreground">{l}</span>
                <input type={type} required={k !== "phone"} className="mt-1 w-full rounded-lg border px-3 py-2.5"
                  value={form[k as keyof typeof form]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
              </label>
            ))}
            <label className="block text-sm">
              <span className="text-muted-foreground">{p.subject}</span>
              <input className="mt-1 w-full rounded-lg border px-3 py-2.5" value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">{p.message}</span>
              <textarea required rows={5} className="mt-1 w-full rounded-lg border px-3 py-2.5" value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </label>
            <Button type="submit" variant="hero" disabled={busy}>{busy ? t.common.loading : t.cta.submit}</Button>
          </form>
        </div>
        <div className="space-y-6">
          <h2 className="font-display text-2xl">{p.coords}</h2>
          {[
            { Icon: MapPin, text: hotel.address },
            { Icon: Phone, text: hotel.phone, href: `tel:${hotel.phone}` },
            { Icon: Mail, text: hotel.email, href: `mailto:${hotel.email}` },
          ].map(({ Icon, text, href }) => (
            <div key={text} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
              <Icon className="mt-0.5 size-5 text-gold-deep" />
              {href ? <a href={href} className="hover:text-gold-deep">{text}</a> : <span>{text}</span>}
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
