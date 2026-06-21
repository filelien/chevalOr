import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, BedDouble, CalendarCheck, Users, UtensilsCrossed, Boxes, Wallet, BarChart3, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth, signOut, type AppRole } from "@/lib/auth";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";

type Item = { to: string; label: string; Icon: typeof LayoutDashboard; roles?: AppRole[]; soon?: boolean };

const items: Item[] = [
  { to: "/admin", label: "Vue d'ensemble", Icon: LayoutDashboard },
  { to: "/admin/chambres", label: "Chambres", Icon: BedDouble, roles: ["super_admin", "manager", "reception", "cleaning_staff"] },
  { to: "/admin/reservations", label: "Réservations", Icon: CalendarCheck, roles: ["super_admin", "manager", "reception"], soon: true },
  { to: "/admin/clients", label: "Clients", Icon: Users, roles: ["super_admin", "manager", "reception"], soon: true },
  { to: "/admin/restaurant", label: "Restaurant", Icon: UtensilsCrossed, roles: ["super_admin", "manager", "restaurant_staff"], soon: true },
  { to: "/admin/stock", label: "Stock", Icon: Boxes, roles: ["super_admin", "manager"], soon: true },
  { to: "/admin/finance", label: "Finance", Icon: Wallet, roles: ["super_admin", "manager", "accountant"], soon: true },
  { to: "/admin/rapports", label: "Rapports", Icon: BarChart3, roles: ["super_admin", "manager"], soon: true },
  { to: "/admin/utilisateurs", label: "Utilisateurs", Icon: Settings, roles: ["super_admin"], soon: true },
];

export function AdminShell() {
  const { user, hasAnyRole, roles } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const visible = items.filter((i) => !i.roles || hasAnyRole(i.roles));

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <Link to="/admin" className="flex items-center gap-2">
          <img src={logo} alt="" className="h-8 w-8" />
          <span className="font-display text-lg">Cheval d'Or</span>
        </Link>
        <button onClick={() => setOpen((o) => !o)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
      </div>

      <div className="flex">
        <aside className={`${open ? "block" : "hidden"} fixed inset-y-0 z-40 w-72 border-r border-border bg-card lg:sticky lg:top-0 lg:block lg:h-screen`}>
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 border-b border-border px-6 py-5">
              <img src={logo} alt="" className="h-10 w-10" />
              <div className="leading-tight">
                <p className="font-display text-lg">Cheval d'Or</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-gold-deep">Administration</p>
              </div>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {visible.map((it) => {
                const active = location.pathname === it.to || (it.to !== "/admin" && location.pathname.startsWith(it.to));
                return (
                  <Link
                    key={it.to}
                    to={it.to as any}
                    onClick={() => setOpen(false)}
                    disabled={it.soon}
                    className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? "bg-onyx text-white" : "text-foreground/80 hover:bg-secondary"} ${it.soon ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <span className="flex items-center gap-3">
                      <it.Icon className="size-4" />
                      {it.label}
                    </span>
                    {it.soon && <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold-deep">Bientôt</span>}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border p-4">
              <p className="truncate text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">{roles.join(", ") || "—"}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild><Link to="/">Site</Link></Button>
                <Button variant="ghost" size="sm" onClick={() => signOut()}><LogOut className="size-4" /></Button>
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