import type { PermissionKey } from "@/lib/permissions";

/**
 * Permission requise par segment de route admin (après /admin/).
 * Vide ou absent = dashboard.view minimum implicite via staff check.
 */
export const ADMIN_ROUTE_PERMISSIONS: Record<string, PermissionKey | PermissionKey[]> = {
  "": "dashboard.view",
  notifications: "notification.view",
  activite: "audit.view",
  chambres: "room.view",
  planning: "reservation.view",
  reservations: "reservation.view",
  clients: "client.view",
  conference: "conference.view",
  evenements: "event.view",
  restaurant: "restaurant.view",
  stock: "stock.view",
  personnel: "staff.view",
  finance: "finance.view",
  paiements: "payment.view",
  rapports: "report.view",
  marketing: "marketing.view",
  avis: "review.view",
  campagnes: "marketing.manage",
  whatsapp: "marketing.manage",
  "site-web": "site.view",
  galerie: "gallery.view",
  messages: "message.view",
  seo: "seo.view",
  utilisateurs: "user.view",
  roles: "role.view",
  parametres: "settings.view",
};

export function routeRequiresPermission(segment: string): PermissionKey | PermissionKey[] | null {
  if (segment in ADMIN_ROUTE_PERMISSIONS) return ADMIN_ROUTE_PERMISSIONS[segment];
  return segment ? null : "dashboard.view";
}

export function canAccessRoute(
  permissions: PermissionKey[],
  segment: string,
): boolean {
  const required = routeRequiresPermission(segment);
  if (!required) return true;
  const keys = Array.isArray(required) ? required : [required];
  return keys.some((k) => permissions.includes(k));
}
