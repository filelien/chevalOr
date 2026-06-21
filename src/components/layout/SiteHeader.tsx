import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, UserCircle } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Accueil" },
  { to: "/chambres", label: "Chambres" },
  { to: "/restaurant", label: "Restaurant" },
  { to: "/galerie", label: "Galerie" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { user, isStaff } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="Hôtel Le Cheval d'Or">
          <img src={logo} alt="" className="h-12 w-12 object-contain" width={48} height={48} />
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-lg font-semibold tracking-wide">Le Cheval d'Or</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold-deep">Hôtel · Togo</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-gold-deep"
              activeProps={{ className: "text-gold-deep" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              {isStaff && (
                <Button variant="goldOutline" size="sm" asChild>
                  <Link to="/admin">Dashboard</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link to="/mes-reservations" className="flex items-center gap-2">
                  <UserCircle className="size-4" /> Mon espace
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>Déconnexion</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Connexion</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/chambres">Réserver</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="lg:hidden p-2"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <div className="flex flex-col px-4 py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3">
              {user ? (
                <>
                  {isStaff && (
                    <Button variant="goldOutline" asChild>
                      <Link to="/admin">Dashboard</Link>
                    </Button>
                  )}
                  <Button variant="ghost" asChild>
                    <Link to="/mes-reservations">Mon espace</Link>
                  </Button>
                  <Button variant="ghost" onClick={() => signOut()}>Déconnexion</Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild><Link to="/auth">Connexion</Link></Button>
                  <Button variant="hero" asChild><Link to="/chambres">Réserver</Link></Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}