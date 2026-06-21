import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-onyx text-[oklch(0.92_0.01_85)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-12 w-12" width={48} height={48} loading="lazy" />
            <span className="font-display text-xl">Le Cheval d'Or</span>
          </div>
          <p className="mt-4 text-sm text-white/60">
            Une adresse d'exception au cœur du Togo. Élégance, sérénité, hospitalité ouest-africaine.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.25em] text-gold">Découvrir</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/chambres" className="hover:text-gold">Chambres & suites</Link></li>
            <li><Link to="/restaurant" className="hover:text-gold">Restaurant</Link></li>
            <li><Link to="/galerie" className="hover:text-gold">Galerie</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.25em] text-gold">Contact</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>Boulevard du Mono, Lomé, Togo</li>
            <li>+228 22 00 00 00</li>
            <li>reservation@chevaldor.tg</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.25em] text-gold">Réservations</h4>
          <p className="text-sm text-white/70">Notre conciergerie est à votre écoute 24h/24.</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Hôtel Le Cheval d'Or — Tous droits réservés.
      </div>
    </footer>
  );
}