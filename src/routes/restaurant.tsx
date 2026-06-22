<<<<<<< HEAD
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { fetchMenu } from "@/lib/restaurant";
import { CHEF } from "@/lib/content";
import { formatXOF } from "@/lib/rooms";
import restaurantImg from "@/assets/restaurant.jpg";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Award, Clock } from "lucide-react";

export const Route = createFileRoute("/restaurant")({
  head: () => ({ meta: [{ title: "La Table du Cheval d'Or — Restaurant gastronomique" }] }),
  component: RestaurantPage,
});

function RestaurantPage() {
  const { data: menu, isLoading } = useQuery({ queryKey: ["public-menu"], queryFn: fetchMenu });
  const [tab, setTab] = useState<"menu" | "reserve">("menu");

  return (
    <SiteShell>
      <PageHero image={restaurantImg} label="Restaurant" title="La Table du Cheval d'Or"
        subtitle="Gastronomie française & saveurs togolaises — inspiration Mandarin Oriental.">
        <div className="mt-6 flex gap-3">
          <Button variant={tab === "menu" ? "hero" : "outline"} className="border-white/40 text-white" onClick={() => setTab("menu")}>La carte</Button>
          <Button variant={tab === "reserve" ? "hero" : "outline"} className="border-white/40 text-white" onClick={() => setTab("reserve")}>Réserver une table</Button>
        </div>
      </PageHero>

      {tab === "menu" ? (
        <>
          <section className="mx-auto max-w-4xl px-6 py-16">
            <Reveal>
              <div className="flex flex-wrap items-center gap-6 rounded-xl border border-border bg-card p-8">
                <div className="flex size-20 items-center justify-center rounded-full bg-gold-soft font-display text-2xl text-gold-deep">EA</div>
                <div>
                  <h2 className="font-display text-2xl">{CHEF.name}</h2>
                  <p className="text-sm text-gold-deep">{CHEF.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground max-w-xl">{CHEF.bio}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {CHEF.awards.map((a) => (
                      <span key={a} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs"><Award className="size-3" />{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </section>
          <section className="mx-auto max-w-4xl px-6 pb-20">
            <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4" /> Ouvert 19h – 23h · Tenue élégante souhaitée
            </div>
            {isLoading ? <p className="text-muted-foreground">Chargement de la carte…</p> : (menu ?? []).map((cat: any) => (
              <Reveal key={cat.id}>
                <h2 className="mt-10 font-display text-3xl border-b border-border pb-2">{cat.name}</h2>
                <div className="mt-4 space-y-4">
                  {(cat.menu_items ?? []).map((item: any) => (
                    <div key={item.id} className="flex justify-between gap-4 border-b border-border/40 pb-4">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                      </div>
                      <span className="shrink-0 font-display text-lg text-gold-deep">{formatXOF(Number(item.price))}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            ))}
          </section>
        </>
      ) : (
        <TableReservationForm />
      )}
    </SiteShell>
  );
}

function TableReservationForm() {
  const [form, setForm] = useState({ date: "", time: "19:30", guests: 2, name: "", email: "", phone: "", notes: "" });
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.from("table_reservations").insert({
        reservation_date: form.date,
        reservation_time: form.time,
        guests_count: form.guests,
        full_name: form.name,
        email: form.email,
        phone: form.phone || null,
        notes: form.notes || null,
      });
      if (error) throw error;
      toast.success("Demande de réservation envoyée ! Confirmation par email.");
      setForm({ date: "", time: "19:30", guests: 2, name: "", email: "", phone: "", notes: "" });
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  }

  return (
    <section className="mx-auto max-w-lg px-6 py-16">
      <h2 className="font-display text-3xl">Réserver une table</h2>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {[
          { key: "date", type: "date", label: "Date" },
          { key: "time", type: "time", label: "Heure" },
          { key: "name", type: "text", label: "Nom complet" },
          { key: "email", type: "email", label: "Email" },
          { key: "phone", type: "tel", label: "Téléphone" },
        ].map(({ key, type, label }) => (
          <label key={key} className="block text-xs uppercase tracking-wider text-muted-foreground">
            {label}
            <input type={type} required={key !== "phone"} value={(form as any)[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
        ))}
        <label className="block text-xs uppercase tracking-wider text-muted-foreground">
          Personnes
          <select value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
            className="mt-1 block w-full rounded-md border border-input px-3 py-2 text-sm">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className="block text-xs uppercase tracking-wider text-muted-foreground">
          Notes
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
            className="mt-1 block w-full rounded-md border border-input px-3 py-2 text-sm" />
        </label>
        <Button type="submit" variant="hero" className="w-full" disabled={busy}>{busy ? "Envoi…" : "Confirmer la demande"}</Button>
      </form>
    </section>
  );
}
=======
import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import restaurantImg from "@/assets/restaurant.jpg";

export const Route = createFileRoute("/restaurant")({
  head: () => ({ meta: [
    { title: "La Table du Cheval d'Or — Restaurant gastronomique" },
    { name: "description", content: "Restaurant gastronomique à Lomé : cuisine française et togolaise, cave d'exception." },
  ] }),
  component: () => (
    <SiteShell>
      <div className="relative h-[60vh] overflow-hidden">
        <img src={restaurantImg} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
          <span className="text-xs uppercase tracking-[0.3em] text-gold">Restaurant</span>
          <h1 className="mt-3 font-display text-5xl md:text-6xl">La Table du Cheval d'Or</h1>
          <p className="mt-4 max-w-xl px-6 text-white/85">Une cuisine de saison entre tradition française et saveurs togolaises.</p>
        </div>
      </div>
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-muted-foreground">La carte complète et la prise de commande POS seront ajoutées dans le module Restaurant à venir.</p>
      </section>
    </SiteShell>
  ),
});
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
