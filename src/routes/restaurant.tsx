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