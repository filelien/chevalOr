import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { LogOut, Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth, signOut } from "@/lib/auth";
import { ADMIN_NAV, isNavItemVisible } from "@/lib/admin-navigation";
import { fetchNotifications } from "@/lib/notifications-admin";
import { useAdminI18n } from "@/hooks/use-admin-i18n";
import { HotelLogo } from "@/components/brand/HotelLogo";
import { Button } from "@/components/ui/button";
import { AdminGlobalSearch } from "@/components/admin/AdminGlobalSearch";
import { AdminImageOverlay } from "@/components/admin/AdminImageOverlay";

export function AdminShell() {
  return <AdminShellInner />;
}

function AdminShellInner() {
  const { user, hasPermission, roles } = useAuth();
  const { ta, lang, setLang } = useAdminI18n();
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
          <HotelLogo size="xs" tone="admin" mark />
          <span className="font-display text-lg">{ta.shell.commandCenter}</span>
        </Link>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setLang(lang === "fr" ? "en" : "fr")} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs uppercase text-white/70">
            <Globe className="size-4" />{lang === "fr" ? "EN" : "FR"}
          </button>
          <button onClick={() => setOpen((o) => !o)} aria-label="Menu" className="text-white/80">{open ? <X /> : <Menu />}</button>
        </div>
      </div>

      <div className="flex">
        <aside className={`${open ? "block" : "hidden"} fixed inset-y-0 z-40 w-72 overflow-y-auto border-r border-white/10 bg-[#12151c] lg:sticky lg:top-0 lg:block lg:h-screen`}>
          <div className="flex min-h-full flex-col">
            <div className="border-b border-white/10 px-6 py-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <HotelLogo size="sm" tone="admin" />
                  <div className="leading-tight">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#c9a227]">ERP · Anié</p>
                  </div>
                </div>
                <button type="button" onClick={() => setLang(lang === "fr" ? "en" : "fr")}
                  className="hidden lg:flex items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-[10px] font-semibold uppercase text-white/70 hover:bg-white/5">
                  <Globe className="size-3.5" />{lang === "fr" ? "EN" : "FR"}
                </button>
              </div>
            </div>
            <div className="border-b border-white/10 px-4 py-3">
              <AdminGlobalSearch />
            </div>
            <nav className="flex-1 px-3 py-4">
              {ADMIN_NAV.map((section) => {
                const visible = section.items.filter((i) => isNavItemVisible(i, hasPermission));
                if (!visible.length) return null;
                return (
                  <div key={section.sectionKey} className="mb-5">
                    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                      {ta.sections[section.sectionKey]}
                    </p>
                    <div className="space-y-0.5">
                      {visible.map((it) => {
                        const pathMatch =
                          location.pathname === it.to ||
                          (it.to !== "/admin" && location.pathname.startsWith(it.to));
                        const searchTab = new URLSearchParams(location.searchStr).get("tab");
                        const active = pathMatch && (
                          it.search?.tab
                            ? searchTab === it.search.tab
                            : it.to === "/admin/stock"
                              ? !searchTab || searchTab === "inventory"
                              : true
                        );
                        return (
                          <Link
                            key={`${section.sectionKey}-${it.to}-${it.navKey}`}
                            to={it.to as "/admin"}
                            search={it.search}
                            onClick={() => setOpen(false)}
                            className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                              active
                                ? "bg-[#c9a227]/15 text-[#f0d78c] ring-1 ring-[#c9a227]/30"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <it.Icon className="size-4 shrink-0" />
                              {ta.nav[it.navKey]}
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
              <p className="mt-1 text-[10px] text-white/30">{ta.shell.version}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10" asChild>
                  <Link to="/">{ta.shell.publicSite}</Link>
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
          <AdminImageOverlay />
        </main>
      </div>
    </div>
  );
}
