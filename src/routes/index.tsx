import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/layout/SiteShell";
import { Button } from "@/components/ui/button";
import { fetchPublicRooms, formatXOF, ROOM_TYPE_LABEL } from "@/lib/rooms";
import hero from "@/assets/hero.jpg";
import restaurantImg from "@/assets/restaurant.jpg";
import roomImg from "@/assets/room-deluxe.jpg";
import { Star, Wifi, Wine, Waves, Coffee, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hôtel Le Cheval d'Or — Luxe & raffinement à Lomé, Togo" },
      { name: "description", content: "Découvrez une adresse d'exception : chambres élégantes, restaurant gastronomique et hospitalité ouest-africaine au cœur de Lomé." },
      { property: "og:title", content: "Hôtel Le Cheval d'Or" },
      { property: "og:description", content: "Élégance discrète, table raffinée, séjour inoubliable au Togo." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: rooms } = useQuery({ queryKey: ["public-rooms"], queryFn: fetchPublicRooms });
  const featured = (rooms ?? []).slice(0, 3);

  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative h-[88vh] min-h-[600px] w-full overflow-hidden">
        <img src={hero} alt="Hôtel Le Cheval d'Or" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center text-white">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-1 text-xs uppercase tracking-[0.3em]">
            <Star className="size-3 fill-current text-gold" /> Hôtel 5 étoiles · Lomé
          </span>
          <h1 className="font-display text-5xl font-medium leading-[1.05] md:text-7xl">
            Hôtel Le Cheval d'Or
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/85 md:text-xl">
            L'art de recevoir à la togolaise. Une parenthèse de raffinement entre océan et palmiers.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/chambres">Réserver une chambre</Link>
            </Button>
            <Button variant="outline" size="xl" className="border-white/60 bg-transparent text-white hover:bg-white/10" asChild>
              <Link to="/restaurant">Découvrir le restaurant</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Bienvenue</span>
        <h2 className="mt-4 font-display text-4xl md:text-5xl">Une adresse d'exception au Togo</h2>
        <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Au Cheval d'Or, l'élégance européenne rencontre la chaleur ouest-africaine. Chambres
          spacieuses, table gastronomique, piscine et conciergerie attentionnée — chaque détail
          est pensé pour rendre votre séjour mémorable.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-6 text-left md:grid-cols-4">
          {[
            { Icon: Wifi, label: "Wifi haut débit" },
            { Icon: Waves, label: "Piscine extérieure" },
            { Icon: Coffee, label: "Petit-déjeuner inclus" },
            { Icon: ShieldCheck, label: "Sécurité 24h/24" },
          ].map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-4">
              <Icon className="size-5 text-gold-deep" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED ROOMS */}
      <section className="bg-secondary/40 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Chambres & suites</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">Sélection signature</h2>
            </div>
            <Button variant="goldOutline" asChild><Link to="/chambres">Toutes les chambres</Link></Button>
          </div>
          {featured.length === 0 ? (
            <FeaturedPlaceholder />
          ) : (
            <div className="grid gap-8 md:grid-cols-3">
              {featured.map((r) => {
                const cover = r.photos.find((p) => p.is_cover) ?? r.photos[0];
                return (
                  <Link key={r.id} to="/chambres/$id" params={{ id: r.id }} className="group block overflow-hidden rounded-xl bg-card shadow-elegant transition-transform hover:-translate-y-1">
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={cover?.url ?? roomImg}
                        alt={r.name}
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6">
                      <span className="text-xs uppercase tracking-[0.25em] text-gold-deep">{ROOM_TYPE_LABEL[r.type]}</span>
                      <h3 className="mt-2 font-display text-2xl">{r.name}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                      <div className="mt-4 flex items-baseline justify-between border-t border-border/60 pt-4">
                        <span className="font-display text-xl text-gold-deep">{formatXOF(r.price_per_night)}</span>
                        <span className="text-xs text-muted-foreground">/ nuit</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* RESTAURANT */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
        <div className="order-2 md:order-1">
          <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">Restaurant</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">La Table du Cheval d'Or</h2>
          <p className="mt-6 text-muted-foreground">
            Notre chef compose chaque jour une cuisine de saison qui marie classiques français et
            saveurs togolaises. Salle intimiste, cave d'exception, service attentionné.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Wine className="size-5 text-gold-deep" />
            <span className="text-sm">Ouvert tous les soirs · 19h – 23h</span>
          </div>
          <Button variant="hero" className="mt-8" asChild>
            <Link to="/restaurant">Voir la carte</Link>
          </Button>
        </div>
        <div className="order-1 overflow-hidden rounded-xl shadow-elegant md:order-2">
          <img src={restaurantImg} alt="Restaurant" className="aspect-[5/4] size-full object-cover" loading="lazy" />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-onyx py-24 text-white">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-gold">Témoignages</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Ils ont aimé leur séjour</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { name: "Aïcha K.", quote: "Service impeccable, chambres somptueuses. Un vrai havre de paix à Lomé.", stars: 5 },
              { name: "Jean-Marc L.", quote: "Le restaurant à lui seul vaut le détour. La table est exceptionnelle.", stars: 5 },
              { name: "Fatou D.", quote: "Une équipe attentionnée et un cadre d'exception. Je reviendrai.", stars: 5 },
            ].map((t) => (
              <div key={t.name} className="rounded-xl border border-white/10 bg-white/5 p-8 text-left">
                <div className="flex gap-1 text-gold">
                  {Array.from({ length: t.stars }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}
                </div>
                <p className="mt-4 text-white/85">"{t.quote}"</p>
                <p className="mt-6 text-sm uppercase tracking-[0.2em] text-gold">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function FeaturedPlaceholder() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
      Aucune chambre n'a encore été ajoutée. Connectez-vous au dashboard pour les créer.
    </div>
  );
}
