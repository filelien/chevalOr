import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import { useI18n } from "@/lib/i18n";
import { useHotelCms } from "@/hooks/use-hotel-cms";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { LanguageSwitcherFooter } from "@/components/site/LanguageSwitcher";
import { Facebook, Instagram, Linkedin } from "lucide-react";

export function SiteFooter() {
  const { t } = useI18n();
  const { hotel } = useHotelCms();
  return (
    <footer className="mt-24 bg-onyx text-[oklch(0.92_0.01_85)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-12 w-12" width={48} height={48} loading="lazy" />
            <span className="font-display text-xl">Le Cheval d'Or</span>
          </div>
          <p className="mt-4 text-sm text-white/60 max-w-sm">{t.footer.tagline}</p>
          <div className="mt-4 flex gap-3">
            {[
              { Icon: Facebook, href: hotel.social.facebook, label: "Facebook" },
              { Icon: Instagram, href: hotel.social.instagram, label: "Instagram" },
              { Icon: Linkedin, href: hotel.social.linkedin, label: "LinkedIn" },
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
            <li><Link to="/chambres" className="hover:text-gold">{t.footer.roomsSuites}</Link></li>
            <li><Link to="/restaurant" className="hover:text-gold">{t.nav.restaurant}</Link></li>
            <li><Link to="/services" className="hover:text-gold">{t.nav.services}</Link></li>
            <li><Link to="/experiences" className="hover:text-gold">{t.nav.experiences}</Link></li>
            <li><Link to="/offres" className="hover:text-gold">{t.footer.specialOffers}</Link></li>
            <li><Link to="/blog" className="hover:text-gold">{t.nav.blog}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.25em] text-gold">{t.footer.contactTitle}</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>{hotel.address}</li>
            <li><a href={`tel:${hotel.phone}`} className="hover:text-gold">{hotel.phone}</a></li>
            <li><a href={`mailto:${hotel.email}`} className="hover:text-gold">{hotel.email}</a></li>
          </ul>
          <h4 className="mb-2 mt-6 text-xs uppercase tracking-[0.25em] text-gold">{t.footer.legal}</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/mentions-legales" className="hover:text-gold">{t.footer.legalNotice}</Link></li>
            <li><Link to="/cgv" className="hover:text-gold">{t.footer.terms}</Link></li>
            <li><Link to="/confidentialite" className="hover:text-gold">{t.footer.privacy}</Link></li>
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
