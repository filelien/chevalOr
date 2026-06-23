import type { DashboardKind } from "@/lib/dashboard-role";
import { DASHBOARD_META } from "@/lib/dashboard-role";

const SHORT_LABELS: Record<DashboardKind, string> = {
  executive: "Direction",
  reception: "Réception",
  housekeeping: "Gouvernante",
  restaurant: "Restaurant",
  accounting: "Comptabilité",
  marketing: "Marketing",
  conference: "Conférence",
  system: "Système",
};

export function DashboardRoleSwitcher({
  kinds,
  active,
  onChange,
}: {
  kinds: DashboardKind[];
  active: DashboardKind;
  onChange: (k: DashboardKind) => void;
}) {
  return (
    <div className="dashboard-role-switcher px-4 py-4 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">
          Vue métier
        </span>
        <div className="flex flex-wrap gap-2">
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => onChange(k)}
              className={`dashboard-role-pill rounded-full px-4 py-2 text-sm ${active === k ? "active" : ""}`}
              title={DASHBOARD_META[k].subtitle}
            >
              <span className="mr-1.5">{DASHBOARD_META[k].emoji}</span>
              {SHORT_LABELS[k]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
