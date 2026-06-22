<<<<<<< HEAD
import { createFileRoute, Link } from "@tanstack/react-router";
=======
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/layout/SiteShell";
import { Button } from "@/components/ui/button";
import { fetchPublicRooms, formatXOF, ROOM_TYPE_LABEL } from "@/lib/rooms";
<<<<<<< HEAD
import {
  HOTEL, STORY, TESTIMONIALS, LOYALTY, EXPERIENCES, PACKS, PROMOTIONS,
  SERVICES, CHEF, HOME, FAQ, GALLERY_IMAGES,
} from "@/lib/content";
import { QuickBookingBar } from "@/components/site/QuickBookingBar";
import { Reveal } from "@/components/site/Reveal";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { SectionHeader, SectionDivider, HomeQuickNav } from "@/components/home/SectionBlocks";
import hero from "@/assets/hero.jpg";
import restaurantImg from "@/assets/restaurant.jpg";
import roomImg from "@/assets/room-deluxe.jpg";
import logo from "@/assets/logo.png";
import {
  Star, ArrowRight, ChevronDown, Award, Sparkles, Wine, MapPin,
  Smartphone, UtensilsCrossed, BedDouble, CalendarHeart, Gem,
  Quote, Check, Play,
} from "lucide-react";

const expImgs: Record<string, string> = { hero, restaurant: restaurantImg, room: roomImg };
const galImgs: Record<string, string> = { hero, restaurant: restaurantImg, room: roomImg };
=======
import hero from "@/assets/hero.jpg";
import restaurantImg from "@/assets/restaurant.jpg";
import roomImg from "@/assets/room-deluxe.jpg";
import { Star, Wifi, Wine, Waves, Coffee, ShieldCheck } from "lucide-react";
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
<<<<<<< HEAD
      { title: "Hôtel Le Cheval d'Or — Palace 5 étoiles à Lomé, Togo" },
      { name: "description", content: "Hôtel premium au Togo : chambres de luxe, restaurant gastronomique, spa, événements. L'excellence hôtelière internationale au cœur de Lomé." },
      { property: "og:title", content: "Hôtel Le Cheval d'Or — Lomé" },
      { property: "og:description", content: "Design Aman · Service Four Seasons · Gastronomie Mandarin Oriental" },
=======
      { title: "Hôtel Le Cheval d'Or — Luxe & raffinement à Lomé, Togo" },
      { name: "description", content: "Découvrez une adresse d'exception : chambres élégantes, restaurant gastronomique et hospitalité ouest-africaine au cœur de Lomé." },
      { property: "og:title", content: "Hôtel Le Cheval d'Or" },
      { property: "og:description", content: "Élégance discrète, table raffinée, séjour inoubliable au Togo." },
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
    ],
  }),
  component: Index,
});

function Index() {
  const { data: rooms } = useQuery({ queryKey: ["public-rooms"], queryFn: fetchPublicRooms });
  const featured = (rooms ?? []).slice(0, 3);

  return (
    <SiteShell>
<<<<<<< HEAD
      {/* ═══ 1. HERO CINÉMATIQUE (Four Seasons / Belmond) ═══ */}
      <section className="hero-cinematic relative h-[92vh] min-h-[640px] w-full overflow-hidden">
        <img src={hero} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <img src={logo} alt="" className="hero-fade-up mb-6 size-20 object-contain drop-shadow-lg" />
          <span className="hero-fade-up hero-fade-up-delay-1 mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-1.5 text-[10px] uppercase tracking-[0.35em] backdrop-blur-sm">
            <Star className="size-3 fill-gold text-gold" /> {HOME.hero.eyebrow}
          </span>
          <h1 className="hero-fade-up hero-fade-up-delay-2 font-display text-5xl font-medium leading-[1.05] md:text-7xl lg:text-8xl">
            <span className="gold-shimmer">{HOME.hero.title}</span>
          </h1>
          <p className="hero-fade-up hero-fade-up-delay-3 mx-auto mt-6 max-w-2xl text-lg text-white/90 md:text-xl">
            {HOME.hero.subtitle}
          </p>
          <div className="hero-fade-up hero-fade-up-delay-4 mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/reserver"><CalendarHeart className="mr-2 size-5" />Réserver votre séjour</Link>
            </Button>
            <Button variant="outline" size="xl" className="border-white/50 bg-white/5 text-white backdrop-blur hover:bg-white/15" asChild>
              <Link to="/a-propos"><Play className="mr-2 size-4" />Notre histoire</Link>
            </Button>
          </div>
        </div>
        <a href="#decouvrir" className="scroll-indicator absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-white/70">
          <span className="text-[10px] uppercase tracking-[0.3em]">{HOME.hero.scrollHint}</span>
          <ChevronDown className="size-5" />
        </a>
      </section>

      {/* ═══ 2. BARRE RÉSERVATION (Marriott / Hilton) ═══ */}
      <div id="decouvrir" className="relative z-20 px-4 md:px-6">
        <QuickBookingBar />
      </div>

      {/* ═══ 3. NAVIGATION RAPIDE ═══ */}
      <div className="mt-8 border-y border-border">
        <HomeQuickNav items={HOME.quickNav} />
      </div>

      {/* ═══ 4. CHIFFRES CLÉS + AWARDS ═══ */}
      <section className="bg-onyx py-14 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {HOTEL.stats.map((s) => (
              <Reveal key={s.label}>
                <div className="text-center">
                  <p className="font-display text-4xl text-gold md:text-5xl">{s.value}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/55">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 border-t border-white/10 pt-8">
            {HOME.awards.map((a) => (
              <span key={a} className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-white/5 px-4 py-1.5 text-xs text-white/80">
                <Award className="size-3.5 text-gold" />{a}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. PHILOSOPHIE / STORYTELLING (Belmond / Aman) ═══ */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <SectionHeader label="Notre vision" title="Une adresse d'exception au Togo" subtitle={STORY.vision} />
          <div className="mt-8 space-y-4 text-muted-foreground leading-relaxed">
            {STORY.paragraphs.slice(0, 2).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {STORY.values.map((v) => (
              <span key={v} className="rounded-full border border-gold/30 px-4 py-1 text-xs uppercase tracking-wider text-gold-deep">{v}</span>
            ))}
          </div>
          <Button variant="goldOutline" className="mt-8" asChild>
            <Link to="/a-propos">En savoir plus <ArrowRight className="ml-1 size-4" /></Link>
          </Button>
        </Reveal>
        <Reveal>
          <div className="relative">
            <img src={roomImg} alt="" className="rounded-xl shadow-elegant aspect-[4/5] w-full object-cover" />
            <div className="absolute -bottom-6 -left-6 max-w-xs rounded-xl border border-border bg-card p-6 shadow-elegant">
              <p className="font-display text-3xl text-gold-deep">Depuis {STORY.founded}</p>
              <p className="mt-1 text-sm text-muted-foreground">Années d'excellence hôtelière à Lomé</p>
            </div>
          </div>
        </Reveal>
      </section>

      <SectionDivider />

      {/* ═══ 6. PILIERS — TOP 10 INSPIRATION ═══ */}
      <section className="bg-secondary/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader align="center" label="L'excellence" title="Ce qui nous distingue" subtitle="Le meilleur des grands palaces internationaux, avec une identité togolaise unique." />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {HOME.pillars.map((p) => (
              <Reveal key={p.title}>
                <div className="card-lift h-full rounded-xl border border-border bg-card p-6">
                  <Gem className="size-6 text-gold-deep" />
                  <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-gold-deep">{p.source}</p>
                  <h3 className="mt-2 font-display text-xl">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. CITATION PARALLAX (Aman) ═══ */}
      <section className="parallax-break relative flex min-h-[420px] items-center justify-center px-6" style={{ backgroundImage: `url(${hero})` }}>
        <div className="absolute inset-0 bg-black/55" />
        <blockquote className="relative z-10 max-w-3xl text-center">
          <Quote className="mx-auto size-10 text-gold" />
          <p className="mt-6 font-display text-2xl leading-relaxed text-white md:text-4xl">"{HOME.quote.text}"</p>
          <footer className="mt-6 text-sm uppercase tracking-[0.25em] text-gold">{HOME.quote.author}</footer>
        </blockquote>
      </section>

      {/* ═══ 8. CHAMBRES SIGNATURE (Peninsula) ═══ */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader label="Hébergement" title="Chambres & suites" subtitle="Confort absolu, design raffiné, vue jardin ou ville. Comparez nos catégories." />
            <div className="flex gap-2">
              <Button variant="goldOutline" asChild><Link to="/comparer">Comparer</Link></Button>
              <Button variant="hero" asChild><Link to="/chambres">Toutes les chambres</Link></Button>
            </div>
          </div>
          {featured.length === 0 ? (
            <div className="mt-12 rounded-xl border border-dashed p-12 text-center text-muted-foreground">Chambres bientôt disponibles.</div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {featured.map((r, idx) => {
                const cover = r.photos.find((p) => p.is_cover) ?? r.photos[0];
                return (
                  <Reveal key={r.id}>
                    <Link to="/chambres/$id" params={{ id: r.id }} className="card-lift group block overflow-hidden rounded-xl bg-card shadow-elegant">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={cover?.url ?? roomImg} alt={r.name} className="size-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                        {idx === 0 && <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-[10px] uppercase tracking-wider text-onyx">Populaire</span>}
                      </div>
                      <div className="p-6">
                        <span className="text-xs uppercase tracking-[0.25em] text-gold-deep">{ROOM_TYPE_LABEL[r.type]}</span>
                        <h3 className="mt-2 font-display text-2xl">{r.name}</h3>
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                          <span className="font-display text-xl text-gold-deep">{formatXOF(r.price_per_night)}<span className="text-xs text-muted-foreground"> / nuit</span></span>
                          <BedDouble className="size-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  </Reveal>
=======
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
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
                );
              })}
            </div>
          )}
        </div>
      </section>

<<<<<<< HEAD
      {/* ═══ 9. SERVICES (Ritz-Carlton) ═══ */}
      <section className="border-y border-border bg-card py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader align="center" label="Services & équipements" title="Tout est pensé pour vous" subtitle="Du wifi fibre au transfert aéroport — un confort total, 24h/24." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.slice(0, 6).map((s) => (
              <Reveal key={s.id}>
                <div className="flex gap-4 rounded-lg border border-border/60 p-5 transition hover:border-gold/40">
                  <Sparkles className="size-5 shrink-0 text-gold-deep mt-0.5" />
                  <div>
                    <h3 className="font-medium">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="goldOutline" asChild><Link to="/services">Voir les 12 services <ArrowRight className="ml-1 size-4" /></Link></Button>
          </div>
        </div>
      </section>

      {/* ═══ 10. RESTAURANT (Mandarin Oriental) ═══ */}
      <section className="grid lg:grid-cols-2">
        <div className="relative min-h-[400px] lg:min-h-[560px]">
          <img src={restaurantImg} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="flex flex-col justify-center bg-onyx px-8 py-16 text-white lg:px-16">
          <SectionHeader dark label="Gastronomie" title="La Table du Cheval d'Or" subtitle="Cuisine franco-togolaise par le Chef Emmanuel Agbeko — primé Gault&Millau Afrique." />
          <div className="mt-6 flex flex-wrap gap-2">
            {CHEF.awards.map((a) => <span key={a} className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold">{a}</span>)}
          </div>
          <p className="mt-6 text-white/75 leading-relaxed">{CHEF.bio}</p>
          <div className="mt-6 flex items-center gap-2 text-sm text-white/60">
            <Wine className="size-4 text-gold" /> {HOTEL.hours.restaurant} · Réservation conseillée
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="hero" asChild><Link to="/restaurant">La carte</Link></Button>
            <Button variant="outline" className="border-white/40 text-white hover:bg-white/10" asChild><Link to="/restaurant">Réserver une table</Link></Button>
          </div>
        </div>
      </section>

      {/* ═══ 11. SPA & BIEN-ÊTRE (Six Senses) ═══ */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <img src={roomImg} alt="" className="rounded-xl shadow-elegant aspect-[5/4] w-full object-cover" />
          </Reveal>
          <Reveal>
            <SectionHeader label="Bien-être" title={HOME.spa.title} subtitle={HOME.spa.subtitle} />
            <ul className="mt-8 grid grid-cols-2 gap-3">
              {HOME.spa.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm"><Check className="size-4 text-gold-deep" />{f}</li>
              ))}
            </ul>
            <Button variant="hero" className="mt-8" asChild><Link to="/experiences">Réserver un rituel spa</Link></Button>
          </Reveal>
        </div>
      </section>

      {/* ═══ 12. EXPÉRIENCES (Belmond) ═══ */}
      <section className="bg-secondary/40 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader label="Expériences" title="Vivez Lomé autrement" subtitle="Excursions, gastronomie, romance — des moments curated par notre conciergerie." />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {EXPERIENCES.map((e) => (
              <Reveal key={e.title}>
                <div className="card-lift overflow-hidden rounded-xl bg-card shadow-elegant">
                  <img src={expImgs[e.image]} alt="" className="aspect-[16/10] w-full object-cover" loading="lazy" />
                  <div className="p-6">
                    <span className="text-xs text-gold-deep">{e.duration}</span>
                    <h3 className="mt-1 font-display text-xl">{e.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{e.desc}</p>
                    <p className="mt-4 font-display text-lg text-gold-deep">{e.price}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Button variant="goldOutline" className="mt-10" asChild><Link to="/experiences">Toutes les expériences</Link></Button>
        </div>
      </section>

      {/* ═══ 13. OFFRES & PACKS (Marriott Bonvoy style) ═══ */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader align="center" label="Offres exclusives" title="Packs & promotions" subtitle="Formules sur mesure — romantique, business, famille ou bien-être." />
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {PROMOTIONS.map((p) => (
              <span key={p.code} className="rounded-full bg-gold-soft/40 px-4 py-2 text-sm">
                <strong className="text-gold-deep">{p.code}</strong> — {p.title}
              </span>
            ))}
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PACKS.map((pk) => (
              <Reveal key={pk.id}>
                <div className="card-lift flex h-full flex-col rounded-xl border border-border bg-card p-6">
                  <span className="w-fit rounded-full bg-onyx px-3 py-0.5 text-[10px] uppercase text-white">{pk.badge}</span>
                  <h3 className="mt-4 font-display text-xl">{pk.name}</h3>
                  <p className="mt-2 font-display text-2xl text-gold-deep">{formatXOF(pk.price)}</p>
                  <ul className="mt-4 flex-1 space-y-1.5 text-sm text-muted-foreground">
                    {pk.includes.map((i) => <li key={i}>✓ {i}</li>)}
                  </ul>
                  <Button variant="goldOutline" className="mt-6 w-full" asChild><Link to="/offres">Détails</Link></Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 14. ÉVÉNEMENTS ═══ */}
      <section className="bg-onyx py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <SectionHeader dark align="center" label="Événements" title="Mariages, séminaires & célébrations" subtitle="Jusqu'à 150 convives — salons, terrasse, traiteur sur mesure." />
          <Button variant="hero" className="mt-8" asChild><Link to="/evenements">Organiser votre événement</Link></Button>
        </div>
      </section>

      {/* ═══ 15. SÉJOUR DIGITAL (Hilton / Hyatt) ═══ */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader align="center" label="Technologie" title={HOME.digital.title} subtitle={HOME.digital.subtitle} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOME.digital.features.map((f) => (
              <Reveal key={f.title}>
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <Smartphone className="mx-auto size-8 text-gold-deep" />
                  <h3 className="mt-4 font-display text-lg">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 flex justify-center gap-4">
            <Button variant="hero" asChild><Link to="/auth">Créer mon compte</Link></Button>
            <Button variant="goldOutline" asChild><Link to="/mes-reservations">Mon espace</Link></Button>
          </div>
        </div>
      </section>

      {/* ═══ 16. LOCALISATION (Peninsula) ═══ */}
      <section className="grid lg:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-16 lg:px-16">
          <SectionHeader label="Destination" title={HOME.location.title} subtitle={HOME.location.desc} />
          <div className="mt-8 grid grid-cols-2 gap-3">
            {HOME.location.highlights.map((h) => (
              <div key={h} className="flex items-center gap-2 rounded-lg bg-secondary/60 px-4 py-3 text-sm">
                <MapPin className="size-4 text-gold-deep" />{h}
              </div>
            ))}
          </div>
          <Button variant="goldOutline" className="mt-8 w-fit" asChild><Link to="/guide">Guide complet Lomé</Link></Button>
        </div>
        <div className="min-h-[320px] lg:min-h-full">
          <iframe title="Carte" src={`https://maps.google.com/maps?q=${HOTEL.coords.lat},${HOTEL.coords.lng}&z=14&output=embed`}
            className="size-full min-h-[320px] border-0" loading="lazy" allowFullScreen />
        </div>
      </section>

      {/* ═══ 17. GALERIE MOSAÏQUE (Instagram style) ═══ */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeader label="Galerie" title="Nos espaces en images" />
            <Button variant="goldOutline" asChild><Link to="/galerie">Galerie complète</Link></Button>
          </div>
          <div className="mosaic-grid mt-10 overflow-hidden rounded-xl">
            {GALLERY_IMAGES.slice(0, 5).map((g, i) => (
              <Link key={i} to="/galerie" className="group relative overflow-hidden">
                <img src={galImgs[g.src]} alt={g.alt} className="size-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4 text-sm text-white opacity-0 transition group-hover:opacity-100">{g.cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 18. PRESSE ═══ */}
      <section className="border-y border-border bg-secondary/20 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 md:grid-cols-2">
            {HOME.press.map((p) => (
              <blockquote key={p.source} className="text-center md:text-left">
                <p className="font-display text-xl italic text-foreground/90">"{p.quote}"</p>
                <footer className="mt-4 text-xs uppercase tracking-[0.2em] text-gold-deep">— {p.source}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 19. TÉMOIGNAGES ═══ */}
      <section className="bg-onyx py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader dark align="center" label="Avis clients" title="Ils ont vécu Cheval d'Or" subtitle="4.9/5 — des voyageurs du monde entier." />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((t) => (
              <Reveal key={t.name}>
                <div className="h-full rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="flex gap-0.5 text-gold">
                    {Array.from({ length: t.stars }).map((_, i) => <Star key={i} className="size-3.5 fill-current" />)}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/85">"{t.quote}"</p>
                  <p className="mt-4 text-xs text-white/50">{t.role}</p>
                  <p className="mt-1 text-sm font-medium text-gold">{t.name}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 20. FIDÉLITÉ (Marriott Bonvoy / Hyatt) ═══ */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <SectionHeader align="center" label="Programme fidélité" title={LOYALTY.name} subtitle="Gagnez des avantages à chaque séjour — restauration, upgrades, spa." />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {LOYALTY.tiers.map((tier, i) => (
              <div key={tier.name} className={`card-lift rounded-xl border p-8 ${i === 1 ? "border-gold bg-gold-soft/20 shadow-gold" : "border-border bg-card"}`}>
                <h3 className="font-display text-2xl text-gold-deep">{tier.name}</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {tier.perks.map((p) => <li key={p}>✓ {p}</li>)}
                </ul>
=======
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
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
              </div>
            ))}
          </div>
        </div>
      </section>
<<<<<<< HEAD

      {/* ═══ 21. FAQ TEASER ═══ */}
      <section className="bg-secondary/30 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <SectionHeader align="center" label="FAQ" title="Questions fréquentes" />
          <div className="mt-10 space-y-4">
            {FAQ.slice(0, 3).map((f) => (
              <details key={f.q} className="group rounded-xl border border-border bg-card p-5">
                <summary className="cursor-pointer font-medium list-none flex justify-between items-center">
                  {f.q}
                  <ChevronDown className="size-4 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="goldOutline" asChild><Link to="/faq">Toutes les questions</Link></Button>
          </div>
        </div>
      </section>

      {/* ═══ 22. CTA FINAL ═══ */}
      <section className="relative overflow-hidden bg-gradient-dark py-24 text-white">
        <div className="absolute inset-0 opacity-20">
          <img src={hero} alt="" className="size-full object-cover" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <UtensilsCrossed className="mx-auto size-10 text-gold" />
          <h2 className="mt-6 font-display text-4xl md:text-5xl">Prêt pour une parenthèse d'exception ?</h2>
          <p className="mt-4 text-white/75">Réservez maintenant ou contactez notre conciergerie — réponse sous 2 heures.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button variant="hero" size="xl" asChild><Link to="/reserver">Réserver une chambre</Link></Button>
            <Button variant="outline" size="xl" className="border-white/50 text-white hover:bg-white/10" asChild><Link to="/contact">Nous contacter</Link></Button>
          </div>
        </div>
      </section>

      {/* ═══ 23. NEWSLETTER ═══ */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-xl px-6 text-center">
          <SectionHeader align="center" label="Newsletter" title="Inspirations & offres privées" subtitle="Rejoignez notre cercle — offres exclusives, événements, guides voyage." />
          <div className="mt-8"><NewsletterForm /></div>
        </div>
      </section>
    </SiteShell>
  );
}
=======
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
>>>>>>> 7a008f259efac475f06da1671ad6d3f8359af014
