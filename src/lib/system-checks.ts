import { auditActionBadge } from "@/lib/audit";
import { computeClientInsights } from "@/lib/crm-insights";
import { easeOutCubic } from "@/lib/animation-utils";
import { moduleRows, permissionAtCell } from "@/lib/permission-matrix";

export type HealthCheck = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
};

/** Vérifications logiques affichées dans l'admin (diagnostic système). */
export function runLogicHealthChecks(): HealthCheck[] {
  const badge = auditActionBadge("reservation_created");
  const perm = permissionAtCell("reservation", "view");
  const insights = computeClientInsights({
    stays: [
      { status: "completed", total_price: 250_000, check_in: "2026-05-01", room_type: "Suite" },
      { status: "cancelled", total_price: 0, check_in: "2025-01-01" },
    ],
    reviewCount: 2,
  });
  const matrixRows = moduleRows();

  return [
    {
      id: "audit-badges",
      label: "Badges journal d'audit",
      ok: badge.className.includes("audit-badge--success") && badge.label === "CRÉATION",
      detail: badge.label,
    },
    {
      id: "rbac-matrix",
      label: "Matrice des permissions",
      ok: perm === "reservation.view" && matrixRows.length >= 10,
      detail: `${matrixRows.length} modules actifs`,
    },
    {
      id: "crm-vip",
      label: "Score VIP client",
      ok: insights.vipScore > 0 && insights.totalStays === 1,
      detail: `${insights.vipTier} · ${insights.vipScore}/100`,
    },
    {
      id: "animations",
      label: "Courbe d'animation",
      ok: easeOutCubic(0) === 0 && easeOutCubic(1) === 1,
      detail: "Easing sans erreur",
    },
    {
      id: "crm-recommendations",
      label: "Recommandations CRM",
      ok: insights.recommendations.length > 0,
      detail: insights.recommendations[0] ?? "—",
    },
  ];
}

export function allChecksPassed(checks: HealthCheck[]): boolean {
  return checks.length > 0 && checks.every((c) => c.ok);
}
