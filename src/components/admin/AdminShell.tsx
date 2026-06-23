import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, BedDouble, CalendarCheck, CalendarRange, Users, UtensilsCrossed,
  Boxes, Wallet, BarChart3, Settings, LogOut, Menu, X, Inbox, Presentation,
  PartyPopper, Image, Star, Megaphone, Globe, Search, Bell, Shield, UserCog,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth, signOut, type AppRole } from "@/lib/auth";
import { fetchNotifications } from "@/lib/notifications-admin";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";

type Item = { to: string; label: string; Icon: typeof LayoutDashboard; roles?: AppRole[] };

const sections: { title: string; items: Item[] }[] = [
  {
    title: "Principal",
    items: [
      { to: "/admin", label: "Tableau de bord", Icon: LayoutDashboard },
      { to: "/admin/notifications", label: "Notifications", Icon: Bell, roles: ["super_admin", "manager", "reception"] },
    ],
  },
  {
    title: "Hébergement",
    items: [
      { to: "/admin/chambres", label: "Chambres", Icon: BedDouble, roles: ["super_admin", "manager", "reception", "cleaning_staff"] },
      { to: "/admin/planning", label: "Planning", Icon: CalendarRange, roles: ["super_admin", "manager", "reception"] },
      { to: "/admin/reservations", label: "Réservations", Icon: CalendarCheck, roles: ["super_admin", "manager", "reception"] },
      { to: "/admin/clients", label: "Clients", Icon: Users, roles: ["super_admin", "manager", "reception"] },
    ],
  },
  {
    title: "Événements",
    items: [
      { to: "/admin/conference", label: "Salle de conférence", Icon: Presentation, roles: ["super_admin", "manager", "reception"] },
      { to: "/admin/evenements", label: "Événements", Icon: PartyPopper, roles: ["super_admin", "manager", "reception"] },
    ],
  },
  {
    title: "Restauration",
    items: [
      { to: "/admin/restaurant", label: "Restaurant", Icon: UtensilsCrossed, roles: ["super_admin", "manager", "restaurant_staff"] },
      { to: "/admin/stock", label: "Stock", Icon: Boxes, roles: ["super_admin", "manager"] },
    ],
  },
  {
    title: "Finance & rapports",
    items: [
      { to: "/admin/finance", label: "Finances", Icon: Wallet, roles: ["super_admin", "manager", "accountant"] },
      { to: "/admin/rapports", label: "Rapports", Icon: BarChart3, roles: ["super_admin", "manager"] },
    ],
  },
  {
    title: "Site & marketing",
    items: [
      { to: "/admin/messages", label: "Messages", Icon: Inbox, roles: ["super_admin", "manager", "reception", "restaurant_staff"] },
      { to: "/admin/galerie", label: "Galerie", Icon: Image, roles: ["super_admin", "manager"] },
      { to: "/admin/avis", label: "Avis clients", Icon: Star, roles: ["super_admin", "manager", "reception"] },
      { to: "/admin/marketing", label: "Marketing", Icon: Megaphone, roles: ["super_admin", "manager"] },
      { to: "/admin/site-web", label: "Site web (CMS)", Icon: Globe, roles: ["super_admin", "manager"] },
      { to: "/admin/seo", label: "SEO", Icon: Search, roles: ["super_admin", "manager"] },
    ],
  },
  {
    title: "Administration",
    items: [
      { to: "/admin/personnel", label: "Personnel", Icon: UserCog, roles: ["super_admin", "manager"] },
      { to: "/admin/utilisateurs", label: "Sécurité & rôles", Icon: Shield, roles: ["super_admin"] },
      { to: "/admin/parametres", label: "Paramètres", Icon: Settings, roles: ["super_admin", "manager"] },
    ],
  },
];

export function AdminShell() {
  const { user, hasAnyRole, roles } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 60_000,
  });
  const unread = (notifications ?? []).filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <Link to="/admin" className="flex items-center gap-2">
          <img src={logo} alt="" className="h-8 w-8" />
          <span className="font-display text-lg">Cheval d'Or</span>
        </Link>
        <button onClick={() => setOpen((o) => !o)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
      </div>

      <div className="flex">
        <aside className={`${open ? "block" : "hidden"} fixed inset-y-0 z-40 w-72 overflow-y-auto border-r border-border bg-card lg:sticky lg:top-0 lg:block lg:h-screen`}>
          <div className="flex min-h-full flex-col">
            <div className="flex items-center gap-3 border-b border-border px-6 py-5">
              <img src={logo} alt="" className="h-10 w-10" />
              <div className="leading-tight">
                <p className="font-display text-lg">Cheval d'Or</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-gold-deep">PMS · Anié</p>
              </div>
            </div>
            <nav className="flex-1 px-3 py-4">
              {sections.map((section) => {
                const visible = section.items.filter((i) => !i.roles || hasAnyRole(i.roles));
                if (!visible.length) return null;
                return (
                  <div key={section.title} className="mb-5">
                    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {section.title}
                    </p>
                    <div className="space-y-0.5">
                      {visible.map((it) => {
                        const active =
                          location.pathname === it.to ||
                          (it.to !== "/admin" && location.pathname.startsWith(it.to));
                        return (
                          <Link
                            key={it.to}
                            to={it.to as "/admin"}
                            onClick={() => setOpen(false)}
                            className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                              active ? "bg-onyx text-white" : "text-foreground/80 hover:bg-secondary"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <it.Icon className="size-4 shrink-0" />
                              {it.label}
                            </span>
                            {it.to === "/admin/notifications" && unread > 0 && (
                              <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-medium text-onyx">
                                {unread}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>
            <div className="border-t border-border p-4">
              <p className="truncate text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">{roles.join(", ") || "—"}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link to="/">Site public</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  <LogOut className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
