import { MODULE_LABELS, PERMISSION_LABELS, type PermissionKey } from "@/lib/permissions";

/** Colonnes de la matrice RBAC (style ERP premium). */
export const MATRIX_COLUMNS = [
  { id: "view", label: "VOIR" },
  { id: "create", label: "AJOUTER" },
  { id: "edit", label: "MODIFIER" },
  { id: "delete", label: "SUPPRIMER" },
  { id: "export", label: "EXPORTER" },
  { id: "validate", label: "VALIDER" },
] as const;

export type MatrixColumnId = (typeof MATRIX_COLUMNS)[number]["id"];

/** Modules affichés dans la matrice (ordre métier). */
export const MATRIX_MODULE_ORDER = [
  "dashboard",
  "reservation",
  "room",
  "client",
  "conference",
  "event",
  "restaurant",
  "stock",
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
  "staff",
] as const;

/** Mapping colonne → clé permission par module. */
const CELL_MAP: Record<string, Partial<Record<MatrixColumnId, PermissionKey>>> = {
  dashboard: { view: "dashboard.view" },
  reservation: {
    view: "reservation.view",
    create: "reservation.create",
    edit: "reservation.edit",
    delete: "reservation.delete",
    export: "reservation.export",
    validate: "reservation.cancel",
  },
  room: {
    view: "room.view",
    create: "room.create",
    edit: "room.edit",
    delete: "room.delete",
  },
  client: {
    view: "client.view",
    create: "client.create",
    edit: "client.edit",
    delete: "client.delete",
    export: "client.export",
  },
  conference: { view: "conference.view", validate: "conference.manage" },
  event: { view: "event.view", validate: "event.manage" },
  restaurant: { view: "restaurant.view", validate: "restaurant.manage" },
  stock: { view: "stock.view", validate: "stock.manage" },
  finance: {
    view: "finance.view",
    create: "finance.create",
    edit: "finance.edit",
    delete: "finance.delete",
    export: "finance.export",
  },
  payment: { view: "payment.view", validate: "payment.manage" },
  report: { view: "report.view", export: "report.export" },
  marketing: { view: "marketing.view", validate: "marketing.manage" },
  review: { view: "review.view", validate: "review.manage" },
  message: { view: "message.view", validate: "message.manage" },
  site: { view: "site.view", validate: "site.manage" },
  gallery: { view: "gallery.view", validate: "gallery.manage" },
  seo: { view: "seo.view", validate: "seo.manage" },
  user: {
    view: "user.view",
    create: "user.create",
    edit: "user.edit",
    delete: "user.delete",
  },
  role: { view: "role.view", validate: "role.manage" },
  settings: { view: "settings.view", edit: "settings.edit" },
  audit: { view: "audit.view" },
  notification: { view: "notification.view" },
  staff: { view: "staff.view", validate: "staff.manage" },
};

export function permissionAtCell(module: string, column: MatrixColumnId): PermissionKey | null {
  const key = CELL_MAP[module]?.[column];
  if (!key) return null;
  return key in PERMISSION_LABELS ? key : null;
}

export function moduleRows() {
  return MATRIX_MODULE_ORDER.map((mod) => ({
    id: mod,
    label: MODULE_LABELS[mod] ?? mod,
    cells: MATRIX_COLUMNS.map((col) => ({
      column: col.id,
      permission: permissionAtCell(mod, col.id),
    })),
  })).filter((row) => row.cells.some((c) => c.permission));
}

export const ROLE_BADGES: Record<string, string> = {
  super_admin: "ADMIN",
  manager: "DG",
  reception: "REC",
  restaurant_staff: "REST",
  accountant: "DAF",
  cleaning_staff: "HK",
};
