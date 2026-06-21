import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { MapPin, Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Hôtel Le Cheval d'Or" }] }),
  component: () => (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Contact</span>
          <h1 className="mt-3 font-display text-5xl">Nous écrire</h1>
          <p className="mt-4 text-muted-foreground">Notre conciergerie reste à votre disposition 24h/24.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { Icon: MapPin, t: "Adresse", v: "Boulevard du Mono, Lomé, Togo" },
            { Icon: Phone, t: "Téléphone", v: "+228 22 00 00 00" },
            { Icon: Mail, t: "Email", v: "reservation@chevaldor.tg" },
          ].map(({ Icon, t, v }) => (
            <div key={t} className="rounded-xl border border-border bg-card p-6 text-center">
              <Icon className="mx-auto size-6 text-gold-deep" />
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">{t}</p>
              <p className="mt-1 font-medium">{v}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  ),
});