import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, UserCircle, ChevronDown } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth, signOut } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";

const mainNav = [
  { to: "/", labelKey: "home" as const, exact: true },
  { to: "/chambres", labelKey: "rooms" as const },
  { to: "/restaurant", labelKey: "restaurant" as const },
  { to: "/services", labelKey: "services" as const },
  { to: "/experiences", labelKey: "experiences" as const },
  { to: "/offres", labelKey: "offers" as const },
  { to: "/contact", labelKey: "contact" as const },
] as const;

const moreNav = [
  { to: "/a-propos", labelKey: "about" as const },
  { to: "/galerie", labelKey: "gallery" as const },
  { to: "/comparer", labelKey: "compare" as const },
  { to: "/evenements", labelKey: "events" as const },
  { to: "/guide", labelKey: "guide" as const },
  { to: "/blog", labelKey: "blog" as const },
  { to: "/faq", labelKey: "faq" as const },
  { to: "/reserver", labelKey: "book" as const },
] as const;

export function SiteHeader() {
  const { user, isStaff } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="Hôtel Le Cheval d'Or">
          <img src={logo} alt="" className="h-12 w-12 object-contain" width={48} height={48} />
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-lg font-semibold tracking-wide">Le Cheval d'Or</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold-deep">Hôtel · Togo</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 xl:flex">
          {mainNav.map((n) => (
            <Link key={n.to} to={n.to}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-gold-deep"
              activeProps={{ className: "text-gold-deep" }}
              activeOptions={{ exact: "exact" in n ? n.exact : false }}>
              {t.nav[n.labelKey]}
            </Link>
          ))}
          <div className="relative">
            <button onClick={() => setMore((m) => !m)} className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-gold-deep">
              Plus <ChevronDown className="size-4" />
            </button>
            {more && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card py-2 shadow-elegant">
                {moreNav.map((n) => (
                  <Link key={n.to} to={n.to} onClick={() => setMore(false)}
                    className="block px-4 py-2 text-sm hover:bg-secondary">{t.nav[n.labelKey]}</Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          {user ? (
            <>
              {isStaff && <Button variant="goldOutline" size="sm" asChild><Link to="/admin">{t.cta.dashboard}</Link></Button>}
              <Button variant="ghost" size="sm" asChild>
                <Link to="/mes-reservations" className="flex items-center gap-2"><UserCircle className="size-4" />{t.cta.mySpace}</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>{t.cta.logout}</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild><Link to="/auth">{t.cta.login}</Link></Button>
              <Button variant="hero" size="sm" asChild><Link to="/reserver">{t.cta.book}</Link></Button>
            </>
          )}
        </div>

        <button className="p-2 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background lg:hidden max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col px-4 py-4">
            {[...mainNav, ...moreNav].map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-3 text-sm font-medium">{t.nav[n.labelKey]}</Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3">
              <LanguageSwitcher />
              {user ? (
                <>
                  {isStaff && <Button variant="goldOutline" asChild><Link to="/admin">{t.cta.dashboard}</Link></Button>}
                  <Button variant="ghost" asChild><Link to="/mes-reservations">{t.cta.mySpace}</Link></Button>
                  <Button variant="ghost" onClick={() => signOut()}>{t.cta.logout}</Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild><Link to="/auth">{t.cta.login}</Link></Button>
                  <Button variant="hero" asChild><Link to="/reserver">{t.cta.book}</Link></Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
