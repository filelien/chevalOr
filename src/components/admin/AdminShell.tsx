import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, BedDouble, CalendarCheck, CalendarRange, Users, UtensilsCrossed,
  Boxes, Wallet, BarChart3, Settings, LogOut, Menu, X, Inbox, Presentation,
  PartyPopper, Image, Star, Megaphone, Globe, Search, Bell, Shield, UserCog,
  CreditCard, MessageCircle, ScrollText, Mail,
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
    title: "Centre de commande",
    items: [
      { to: "/admin", label: "Tableau de bord", Icon: LayoutDashboard },
      { to: "/admin/notifications", label: "Alertes", Icon: Bell, roles: ["super_admin", "manager", "reception"] },
      { to: "/admin/activite", label: "Journal d'activité", Icon: ScrollText, roles: ["super_admin", "manager"] },
    ],
  },
  {
    title: "Gestion hôtelière",
    items: [
      { to: "/admin/chambres", label: "Chambres", Icon: BedDouble, roles: ["super_admin", "manager", "reception", "cleaning_staff"] },
      { to: "/admin/planning", label: "Planning", Icon: CalendarRange, roles: ["super_admin", "manager", "reception"] },
      { to: "/admin/reservations", label: "Réservations", Icon: CalendarCheck, roles: ["super_admin", "manager", "reception"] },
      { to: "/admin/clients", label: "Clients (CRM)", Icon: Users, roles: ["super_admin", "manager", "reception"] },
      { to: "/admin/conference", label: "Salle de conférence", Icon: Presentation, roles: ["super_admin", "manager", "reception"] },
      { to: "/admin/evenements", label: "Événements", Icon: PartyPopper, roles: ["super_admin", "manager", "reception"] },
    ],
  },
  {
    title: "Exploitation",
    items: [
      { to: "/admin/restaurant", label: "Restaurant", Icon: UtensilsCrossed, roles: ["super_admin", "manager", "restaurant_staff"] },
      { to: "/admin/stock", label: "Stocks", Icon: Boxes, roles: ["super_admin", "manager"] },
      { to: "/admin/personnel", label: "Personnel", Icon: UserCog, roles: ["super_admin", "manager"] },
    ],
  },
  {
    title: "Finances",
    items: [
      { to: "/admin/finance", label: "Comptabilité", Icon: Wallet, roles: ["super_admin", "manager", "accountant"] },
      { to: "/admin/paiements", label: "Paiements", Icon: CreditCard, roles: ["super_admin", "manager", "accountant", "reception"] },
      { to: "/admin/rapports", label: "Rapports", Icon: BarChart3, roles: ["super_admin", "manager"] },
    ],
  },
  {
    title: "Marketing",
    items: [
      { to: "/admin/marketing", label: "Promotions", Icon: Megaphone, roles: ["super_admin", "manager"] },
      { to: "/admin/avis", label: "Avis clients", Icon: Star, roles: ["super_admin", "manager", "reception"] },
      { to: "/admin/campagnes", label: "Campagnes email", Icon: Mail, roles: ["super_admin", "manager"] },
      { to: "/admin/whatsapp", label: "WhatsApp", Icon: MessageCircle, roles: ["super_admin", "manager"] },
    ],
  },
  {
    title: "Site web",
    items: [
      { to: "/admin/site-web", label: "Pages & contenu", Icon: Globe, roles: ["super_admin", "manager"] },
      { to: "/admin/galerie", label: "Médiathèque", Icon: Image, roles: ["super_admin", "manager"] },
      { to: "/admin/messages", label: "Messages", Icon: Inbox, roles: ["super_admin", "manager", "reception", "restaurant_staff"] },
      { to: "/admin/seo", label: "SEO", Icon: Search, roles: ["super_admin", "manager"] },
    ],
  },
  {
    title: "Administration",
    items: [
      { to: "/admin/utilisateurs", label: "Utilisateurs & rôles", Icon: Shield, roles: ["super_admin"] },
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
    <div className="min-h-screen bg-[#0f1115] text-[#e8eaed]">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#161a22] px-4 py-3 lg:hidden">
        <Link to="/admin" className="flex items-center gap-2">
          <img src={logo} alt="" className="h-8 w-8" />
          <span className="font-display text-lg">Command Center</span>
        </Link>
        <button onClick={() => setOpen((o) => !o)} aria-label="Menu" className="text-white/80">{open ? <X /> : <Menu />}</button>
      </div>

      <div className="flex">
        <aside className={`${open ? "block" : "hidden"} fixed inset-y-0 z-40 w-72 overflow-y-auto border-r border-white/10 bg-[#12151c] lg:sticky lg:top-0 lg:block lg:h-screen`}>
          <div className="flex min-h-full flex-col">
            <div className="border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-3">
                <img src={logo} alt="" className="h-10 w-10" />
                <div className="leading-tight">
                  <p className="font-display text-lg text-white">Le Cheval d'Or</p>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#c9a227]">ERP Hôtelier · Anié</p>
                </div>
              </div>
            </div>
            <nav className="flex-1 px-3 py-4">
              {sections.map((section) => {
                const visible = section.items.filter((i) => !i.roles || hasAnyRole(i.roles));
                if (!visible.length) return null;
                return (
                  <div key={section.title} className="mb-5">
                    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
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
                              active
                                ? "bg-[#c9a227]/15 text-[#f0d78c] ring-1 ring-[#c9a227]/30"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <it.Icon className="size-4 shrink-0" />
                              {it.label}
                            </span>
                            {it.to === "/admin/notifications" && unread > 0 && (
                              <span className="rounded-full bg-[#c9a227] px-2 py-0.5 text-[10px] font-medium text-[#12151c]">
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
            <div className="border-t border-white/10 p-4">
              <p className="truncate text-sm font-medium text-white">{user?.email}</p>
              <p className="text-xs text-white/45">{roles.join(", ") || "—"}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10" asChild>
                  <Link to="/">Site public</Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-white/70 hover:bg-white/10" onClick={() => signOut()}>
                  <LogOut className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-[#f4f5f7] text-foreground">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
