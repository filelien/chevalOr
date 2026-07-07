import type { PermissionKey } from "@/lib/permissions";
import type { AdminNavKey } from "@/lib/admin-i18n";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Bell, BedDouble, CalendarRange, CalendarCheck, Users, Presentation,
  PartyPopper, UtensilsCrossed, Boxes, UserCog, Wallet, CreditCard, BarChart3, Megaphone,
  Star, Mail, MessageCircle, Globe, Image, Inbox, Search, Shield, UserCog as UsersCog,
  ScrollText, Settings, Layers, Ticket, Building2, ScanLine, Lock, Monitor, QrCode, Workflow,
} from "lucide-react";

export type AdminNavSectionKey = "pilotage" | "hotel" | "ops" | "finance" | "marketing" | "site" | "admin";

export type AdminNavItem = {
  to: string;
  navKey: AdminNavKey;
  Icon: LucideIcon;
  permission?: PermissionKey;
  anyPermission?: PermissionKey[];
  search?: Record<string, string>;
};

export type AdminNavSection = {
  sectionKey: AdminNavSectionKey;
  items: AdminNavItem[];
};

export const ADMIN_NAV: AdminNavSection[] = [
  {
    sectionKey: "pilotage",
    items: [
      { to: "/admin", navKey: "dashboard", Icon: LayoutDashboard, permission: "dashboard.view" },
      { to: "/admin/notifications", navKey: "alerts", Icon: Bell, permission: "notification.view" },
    ],
  },
  {
    sectionKey: "hotel",
    items: [
      { to: "/admin/chambres", navKey: "rooms", Icon: BedDouble, permission: "room.view" },
      { to: "/admin/planning", navKey: "planning", Icon: CalendarRange, permission: "reservation.view" },
      { to: "/admin/reservations", navKey: "reservations", Icon: CalendarCheck, permission: "reservation.view" },
      { to: "/admin/clients", navKey: "clients", Icon: Users, permission: "client.view" },
      { to: "/admin/conference", navKey: "conference", Icon: Presentation, permission: "conference.view" },
      { to: "/admin/evenements", navKey: "events", Icon: PartyPopper, permission: "event.view" },
    ],
  },
  {
    sectionKey: "ops",
    items: [
      { to: "/admin/restaurant", navKey: "restaurant", Icon: UtensilsCrossed, permission: "restaurant.view" },
      { to: "/admin/operations", navKey: "operations360", Icon: Workflow, permission: "restaurant.view" },
      { to: "/admin/stock", navKey: "stock", Icon: Boxes, permission: "stock.view" },
      { to: "/admin/personnel", navKey: "staff", Icon: UserCog, permission: "staff.view" },
    ],
  },
  {
    sectionKey: "finance",
    items: [
      { to: "/admin/finance", navKey: "accounting", Icon: Wallet, permission: "finance.view" },
      { to: "/admin/paiements", navKey: "payments", Icon: CreditCard, permission: "payment.view" },
      { to: "/admin/rapports", navKey: "reports", Icon: BarChart3, permission: "report.view" },
    ],
  },
  {
    sectionKey: "marketing",
    items: [
      { to: "/admin/marketing", navKey: "promos", Icon: Megaphone, permission: "marketing.view" },
      { to: "/admin/avis", navKey: "reviews", Icon: Star, permission: "review.view" },
      { to: "/admin/campagnes", navKey: "campaigns", Icon: Mail, permission: "marketing.manage" },
      { to: "/admin/whatsapp", navKey: "whatsapp", Icon: MessageCircle, permission: "marketing.manage" },
    ],
  },
  {
    sectionKey: "site",
    items: [
      { to: "/admin/site-web", navKey: "cms", Icon: Globe, permission: "site.view" },
      { to: "/admin/cms-enterprise", navKey: "cmsEnterprise", Icon: Globe, permission: "site.view" },
      { to: "/admin/galerie", navKey: "media", Icon: Image, permission: "gallery.view" },
      { to: "/admin/messages", navKey: "messages", Icon: Inbox, permission: "message.view" },
      { to: "/admin/seo", navKey: "seo", Icon: Search, permission: "seo.view" },
    ],
  },
  {
    sectionKey: "admin",
    items: [
      { to: "/admin/utilisateurs", navKey: "users", Icon: UsersCog, permission: "user.view" },
      { to: "/admin/groupes", navKey: "groups", Icon: Layers, permission: "user.view" },
      { to: "/admin/tickets", navKey: "tickets", Icon: Ticket, permission: "message.view" },
      { to: "/admin/codes", navKey: "entityCodes", Icon: QrCode, permission: "entity_code.view" },
      { to: "/admin/suite-enterprise", navKey: "enterprise", Icon: Building2, permission: "settings.view" },
      { to: "/admin/stock", navKey: "scanStock", Icon: ScanLine, permission: "stock.view", search: { tab: "scan" } },
      { to: "/admin/securite", navKey: "security", Icon: Lock, anyPermission: ["settings.view", "role.view"] },
      { to: "/admin/roles", navKey: "roles", Icon: Shield, permission: "role.view" },
      { to: "/admin/activite", navKey: "audit", Icon: ScrollText, permission: "audit.view" },
      { to: "/admin/surveillance", navKey: "surveillance", Icon: Monitor, permission: "audit.view" },
      { to: "/admin/parametres", navKey: "settings", Icon: Settings, permission: "settings.view" },
    ],
  },
];

export function isNavItemVisible(
  item: AdminNavItem,
  hasPermission: (p: PermissionKey) => boolean,
): boolean {
  if (item.anyPermission?.length) {
    return item.anyPermission.some((p) => hasPermission(p));
  }
  if (!item.permission) return true;
  return hasPermission(item.permission);
}
