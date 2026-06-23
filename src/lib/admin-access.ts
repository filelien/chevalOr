import type { AppRole } from "@/lib/auth";

/** Rôles requis par segment de route admin (après /admin/). Vide = tous les staff. */
export const ADMIN_ROUTE_ROLES: Record<string, AppRole[]> = {
  utilisateurs: ["super_admin"],
  finance: ["super_admin", "manager", "accountant"],
  stock: ["super_admin", "manager"],
  rapports: ["super_admin", "manager"],
  galerie: ["super_admin", "manager"],
  marketing: ["super_admin", "manager"],
  "site-web": ["super_admin", "manager"],
  seo: ["super_admin", "manager"],
  personnel: ["super_admin", "manager"],
  paiements: ["super_admin", "manager", "accountant", "reception"],
  activite: ["super_admin", "manager"],
  campagnes: ["super_admin", "manager"],
  whatsapp: ["super_admin", "manager"],
  chambres: ["super_admin", "manager", "reception", "cleaning_staff"],
};
