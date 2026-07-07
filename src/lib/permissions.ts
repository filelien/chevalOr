/** Permissions granulaires RBAC — source de vérité côté client (miroir de la table `permissions`). */

export const PERMISSION_MODULES = [
  "dashboard",
  "reservation",
  "room",
  "client",
  "conference",
  "event",
  "restaurant",
  "stock",
  "staff",
  "finance",
  "payment",
  "report",
  "marketing",
  "review",
  "message",
  "site",
  "gallery",
  "seo",
  "user",
  "role",
  "settings",
  "audit",
  "notification",
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export type PermissionKey =
  | "dashboard.view"
  | "reservation.view" | "reservation.create" | "reservation.edit" | "reservation.delete" | "reservation.cancel" | "reservation.export"
  | "room.view" | "room.create" | "room.edit" | "room.delete"
  | "client.view" | "client.create" | "client.edit" | "client.delete" | "client.export"
  | "conference.view" | "conference.manage"
  | "event.view" | "event.manage"
  | "restaurant.view" | "restaurant.manage"
  | "stock.view" | "stock.manage"
  | "staff.view" | "staff.manage"
  | "finance.view" | "finance.create" | "finance.edit" | "finance.delete" | "finance.export"
  | "payment.view" | "payment.manage"
  | "report.view" | "report.export"
  | "marketing.view" | "marketing.manage"
  | "review.view" | "review.manage"
  | "message.view" | "message.manage"
  | "site.view" | "site.manage"
  | "gallery.view" | "gallery.manage"
  | "seo.view" | "seo.manage"
  | "user.view" | "user.create" | "user.edit" | "user.delete"
  | "role.view" | "role.manage"
  | "settings.view" | "settings.edit"
  | "audit.view"
  | "notification.view";

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  "dashboard.view": "Tableau de bord",
  "reservation.view": "Voir réservations",
  "reservation.create": "Créer réservations",
  "reservation.edit": "Modifier réservations",
  "reservation.delete": "Supprimer réservations",
  "reservation.cancel": "Annuler réservations",
  "reservation.export": "Exporter réservations",
  "room.view": "Voir chambres",
  "room.create": "Créer chambres",
  "room.edit": "Modifier chambres",
  "room.delete": "Supprimer chambres",
  "client.view": "Voir clients",
  "client.create": "Créer clients",
  "client.edit": "Modifier clients",
  "client.delete": "Supprimer clients",
  "client.export": "Exporter clients",
  "conference.view": "Voir conférences",
  "conference.manage": "Gérer conférences",
  "event.view": "Voir événements",
  "event.manage": "Gérer événements",
  "restaurant.view": "Voir restaurant",
  "restaurant.manage": "Gérer restaurant",
  "stock.view": "Voir stocks",
  "stock.manage": "Gérer stocks",
  "staff.view": "Voir personnel",
  "staff.manage": "Gérer personnel",
  "finance.view": "Voir finances",
  "finance.create": "Créer écritures",
  "finance.edit": "Modifier finances",
  "finance.delete": "Supprimer finances",
  "finance.export": "Exporter finances",
  "payment.view": "Voir paiements",
  "payment.manage": "Gérer paiements",
  "report.view": "Voir rapports",
  "report.export": "Exporter rapports",
  "marketing.view": "Voir marketing",
  "marketing.manage": "Gérer marketing",
  "review.view": "Voir avis",
  "review.manage": "Modérer avis",
  "message.view": "Voir messages",
  "message.manage": "Gérer messages",
  "site.view": "Voir site web",
  "site.manage": "Gérer site web",
  "gallery.view": "Voir galerie",
  "gallery.manage": "Gérer galerie",
  "seo.view": "Voir SEO",
  "seo.manage": "Gérer SEO",
  "user.view": "Voir utilisateurs",
  "user.create": "Créer utilisateurs",
  "user.edit": "Modifier utilisateurs",
  "user.delete": "Supprimer utilisateurs",
  "role.view": "Voir rôles",
  "role.manage": "Gérer rôles",
  "settings.view": "Voir paramètres",
  "settings.edit": "Modifier paramètres",
  "audit.view": "Journal d'audit",
  "notification.view": "Alertes",
};

/** Actions CRUD par module pour la matrice de permissions. */
export const MODULE_ACTIONS: Record<string, { key: PermissionKey; label: string }[]> = {
  reservation: [
    { key: "reservation.view", label: "Voir" },
    { key: "reservation.create", label: "Créer" },
    { key: "reservation.edit", label: "Modifier" },
    { key: "reservation.delete", label: "Supprimer" },
    { key: "reservation.cancel", label: "Annuler" },
    { key: "reservation.export", label: "Exporter" },
  ],
  room: [
    { key: "room.view", label: "Voir" },
    { key: "room.create", label: "Créer" },
    { key: "room.edit", label: "Modifier" },
    { key: "room.delete", label: "Supprimer" },
  ],
  client: [
    { key: "client.view", label: "Voir" },
    { key: "client.create", label: "Créer" },
    { key: "client.edit", label: "Modifier" },
    { key: "client.delete", label: "Supprimer" },
    { key: "client.export", label: "Exporter" },
  ],
  finance: [
    { key: "finance.view", label: "Voir" },
    { key: "finance.create", label: "Créer" },
    { key: "finance.edit", label: "Modifier" },
    { key: "finance.delete", label: "Supprimer" },
    { key: "finance.export", label: "Exporter" },
  ],
  user: [
    { key: "user.view", label: "Voir" },
    { key: "user.create", label: "Créer" },
    { key: "user.edit", label: "Modifier" },
    { key: "user.delete", label: "Supprimer" },
  ],
};

export const MODULE_LABELS: Record<string, string> = {
  dashboard: "Tableau de bord",
  reservation: "Réservations",
  room: "Chambres",
  client: "Clients",
  conference: "Conférence",
  event: "Événements",
  restaurant: "Restaurant",
  stock: "Stocks",
  staff: "Personnel",
  finance: "Finances",
  payment: "Paiements",
  report: "Rapports",
  marketing: "Marketing",
  review: "Avis",
  message: "Messages",
  site: "Site web",
  gallery: "Galerie",
  seo: "SEO",
  user: "Utilisateurs",
  role: "Rôles",
  settings: "Paramètres",
  audit: "Audit",
  notification: "Alertes",
};
