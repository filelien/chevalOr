import type { AppRole } from "@/lib/auth";

export type DashboardKind =
  | "executive"
  | "reception"
  | "housekeeping"
  | "restaurant"
  | "accounting"
  | "marketing"
  | "conference"
  | "system";

const ROLE_PRIORITY: AppRole[] = [
  "super_admin",
  "manager",
  "reception",
  "accountant",
  "restaurant_staff",
  "cleaning_staff",
];

export const DASHBOARD_META: Record<DashboardKind, { title: string; subtitle: string; emoji: string }> = {
  executive: {
    emoji: "👑",
    title: "Direction & pilotage",
    subtitle: "Vue exécutive : revenus, occupation, alertes et performances globales.",
  },
  reception: {
    emoji: "🏨",
    title: "Réception",
    subtitle: "Arrivées, départs, disponibilités et actions du jour.",
  },
  housekeeping: {
    emoji: "🛏️",
    title: "Gouvernante & entretien",
    subtitle: "État des chambres, nettoyage et maintenance.",
  },
  restaurant: {
    emoji: "🍽️",
    title: "Restaurant",
    subtitle: "Commandes, tables et chiffre d'affaires du service.",
  },
  accounting: {
    emoji: "💰",
    title: "Comptabilité",
    subtitle: "Revenus, dépenses et exports comptables.",
  },
  marketing: {
    emoji: "📢",
    title: "Marketing",
    subtitle: "Promotions, avis clients et campagnes.",
  },
  conference: {
    emoji: "🏢",
    title: "Salle de conférence",
    subtitle: "Réservations, planning et devis.",
  },
  system: {
    emoji: "🔒",
    title: "Administration système",
    subtitle: "Utilisateurs, rôles, sécurité et audit.",
  },
};

/** Détermine le dashboard principal selon le rôle staff le plus élevé. */
export function resolveDashboardKind(roles: AppRole[]): DashboardKind {
  const staff = roles.filter((r) => r !== "customer");
  for (const role of ROLE_PRIORITY) {
    if (!staff.includes(role)) continue;
    switch (role) {
      case "super_admin":
        return "executive";
      case "manager":
        return "executive";
      case "reception":
        return "reception";
      case "accountant":
        return "accounting";
      case "restaurant_staff":
        return "restaurant";
      case "cleaning_staff":
        return "housekeeping";
      default:
        break;
    }
  }
  return "executive";
}
