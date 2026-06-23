import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import { HOTEL } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { LanguageSwitcherFooter } from "@/components/site/LanguageSwitcher";
import { Facebook, Instagram, Linkedin } from "lucide-react";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 bg-onyx text-[oklch(0.92_0.01_85)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-12 w-12" width={48} height={48} loading="lazy" />
            <span className="font-display text-xl">Le Cheval d'Or</span>
          </div>
          <p className="mt-4 text-sm text-white/60 max-w-sm">
            Une adresse d'exception au cœur du Togo. Design inspiré des plus grands palaces internationaux, hospitalité ouest-africaine authentique.
          </p>
          <div className="mt-4 flex gap-3">
            {[
              { Icon: Facebook, href: HOTEL.social.facebook, label: "Facebook" },
              { Icon: Instagram, href: HOTEL.social.instagram, label: "Instagram" },
              { Icon: Linkedin, href: HOTEL.social.linkedin, label: "LinkedIn" },
            ].map(({ Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="rounded-full border border-white/20 p-2 text-white/60 hover:border-gold hover:text-gold" aria-label={label}>
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.25em] text-gold">{t.footer.discover}</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/chambres" className="hover:text-gold">Chambres & suites</Link></li>
            <li><Link to="/restaurant" className="hover:text-gold">Restaurant</Link></li>
            <li><Link to="/services" className="hover:text-gold">Services</Link></li>
            <li><Link to="/experiences" className="hover:text-gold">Expériences</Link></li>
            <li><Link to="/offres" className="hover:text-gold">Offres spéciales</Link></li>
            <li><Link to="/blog" className="hover:text-gold">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.25em] text-gold">Contact</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>{HOTEL.address}</li>
            <li><a href={`tel:${HOTEL.phone}`} className="hover:text-gold">{HOTEL.phone}</a></li>
            <li><a href={`mailto:${HOTEL.email}`} className="hover:text-gold">{HOTEL.email}</a></li>
          </ul>
          <h4 className="mb-2 mt-6 text-xs uppercase tracking-[0.25em] text-gold">{t.footer.legal}</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/mentions-legales" className="hover:text-gold">Mentions légales</Link></li>
            <li><Link to="/cgv" className="hover:text-gold">CGV</Link></li>
            <li><Link to="/confidentialite" className="hover:text-gold">Confidentialité</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.25em] text-gold">{t.footer.newsletter}</h4>
          <NewsletterForm />
          <div className="mt-6"><LanguageSwitcherFooter /></div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Hôtel Le Cheval d'Or — {t.footer.rights}
      </div>
    </footer>
  );
}
