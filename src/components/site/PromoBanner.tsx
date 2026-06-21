import { Link } from "@tanstack/react-router";
import { PROMOTIONS } from "@/lib/content";
import { Sparkles } from "lucide-react";

export function PromoBanner() {
  const promo = PROMOTIONS[0];
  return (
    <div className="bg-gradient-gold py-2 text-center text-sm font-medium text-onyx">
      <Sparkles className="mr-1 inline size-4" />
      {promo.title} — Code <strong>{promo.code}</strong>
      <Link to="/offres" className="ml-2 underline underline-offset-2">Voir les offres</Link>
    </div>
  );
}
