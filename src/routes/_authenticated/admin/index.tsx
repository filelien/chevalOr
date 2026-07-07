import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { DashboardRoleSwitcher } from "@/components/admin/dashboards/DashboardRoleSwitcher";
import { resolveDashboardKind, type DashboardKind } from "@/lib/dashboard-role";
import { fetchExtendedDashboardStats } from "@/lib/role-dashboard-stats";
import { DashboardSkeleton } from "@/components/admin/dashboards/shared";
import {
  ExecutiveDashboard, ReceptionDashboard, HousekeepingDashboard,
  RestaurantDashboard, AccountingDashboard, MarketingDashboard, ConferenceDashboard,
} from "@/components/admin/dashboards/RoleDashboards";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

const ALL_KINDS: DashboardKind[] = [
  "executive", "reception", "housekeeping", "restaurant",
  "accounting", "marketing", "conference",
];

function Dashboard() {
  const { roles, hasPermission, hasRole } = useAuth();
  const defaultKind = resolveDashboardKind(roles);
  const [override, setOverride] = useState<DashboardKind | null>(null);
  const kind = override ?? defaultKind;

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-extended"],
    queryFn: fetchExtendedDashboardStats,
    refetchInterval: 90_000,
  });

  if (isLoading || !stats) return <DashboardSkeleton />;

  const canSwitch = hasRole("super_admin") || hasRole("manager");

  const renderDashboard = () => {
    switch (kind) {
      case "reception":
        return hasPermission("reservation.view") ? <ReceptionDashboard stats={stats} /> : <ExecutiveDashboard stats={stats} />;
      case "housekeeping":
        return hasPermission("room.view") ? <HousekeepingDashboard stats={stats} /> : <ExecutiveDashboard stats={stats} />;
      case "restaurant":
        return hasPermission("restaurant.view") ? <RestaurantDashboard stats={stats} /> : <ExecutiveDashboard stats={stats} />;
      case "accounting":
        return hasPermission("finance.view") ? <AccountingDashboard stats={stats} /> : <ExecutiveDashboard stats={stats} />;
      case "marketing":
        return hasPermission("marketing.view") ? <MarketingDashboard stats={stats} /> : <ExecutiveDashboard stats={stats} />;
      case "conference":
        return hasPermission("conference.view") ? <ConferenceDashboard stats={stats} /> : <ExecutiveDashboard stats={stats} />;
      default:
        return <ExecutiveDashboard stats={stats} />;
    }
  };

  return (
    <div>
      {canSwitch && (
        <DashboardRoleSwitcher
          kinds={ALL_KINDS}
          active={kind}
          onChange={(k) => setOverride(k === defaultKind ? null : k)}
        />
      )}
      {renderDashboard()}
    </div>
  );
}
