import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { HOTEL } from "@/lib/content";
import hero from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Cheval d'Or" }] }),
  component: ContactPage,
});

function ContactPage() {
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
      toast.success("Message envoyé ! Notre équipe vous répond sous 24h.");
      setForm({ name: "", email: "", phone: "", subject: "Réservation", message: "" });
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  }

  return (
    <SiteShell>
      <PageHero image={hero} label="Contact" title="Conciergerie 24h/24" subtitle="Notre équipe est à votre écoute pour toute demande." />
      <section className="mx-auto max-w-7xl px-6 py-16 grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl">Nous écrire</h2>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {[
              { k: "name", l: "Nom", t: "text" },
              { k: "email", l: "Email", t: "email" },
              { k: "phone", l: "Téléphone", t: "tel" },
            ].map(({ k, l, t }) => (
              <label key={k} className="block text-xs uppercase tracking-wider text-muted-foreground">{l}
                <input type={t} required={k !== "phone"} value={(form as any)[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-input px-3 py-2 text-sm" />
              </label>
            ))}
            <label className="block text-xs uppercase tracking-wider text-muted-foreground">Sujet
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="mt-1 block w-full rounded-md border border-input px-3 py-2 text-sm">
                <option>Réservation</option><option>Restaurant</option><option>Événement</option><option>Autre</option>
              </select>
            </label>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground">Message
              <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1 block w-full rounded-md border border-input px-3 py-2 text-sm" />
            </label>
            <Button type="submit" variant="hero" disabled={busy}>{busy ? "Envoi…" : "Envoyer"}</Button>
          </form>
        </div>
        <div>
          <h2 className="font-display text-2xl">Coordonnées</h2>
          <ul className="mt-6 space-y-4">
            <li className="flex gap-3"><MapPin className="size-5 text-gold-deep shrink-0" /><span>{HOTEL.address}</span></li>
            <li className="flex gap-3"><Phone className="size-5 text-gold-deep shrink-0" /><a href={`tel:${HOTEL.phone}`}>{HOTEL.phone}</a></li>
            <li className="flex gap-3"><Mail className="size-5 text-gold-deep shrink-0" /><a href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a></li>
          </ul>
          <div className="mt-8 overflow-hidden rounded-xl border border-border">
            <iframe
              title="Carte Google Maps"
              src={`https://maps.google.com/maps?q=${HOTEL.coords.lat},${HOTEL.coords.lng}&z=15&output=embed`}
              className="h-64 w-full border-0" loading="lazy" allowFullScreen
            />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
