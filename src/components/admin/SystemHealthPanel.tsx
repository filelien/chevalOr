import { useMemo } from "react";
import { CheckCircle2, XCircle, Activity } from "lucide-react";
import { allChecksPassed, runLogicHealthChecks } from "@/lib/system-checks";

/** Panneau diagnostic visible dans l'admin — reflète les tests unitaires métier. */
export function SystemHealthPanel() {
  const checks = useMemo(() => runLogicHealthChecks(), []);
  const passed = allChecksPassed(checks);

  return (
    <section className="health-panel rounded-xl border border-border bg-card shadow-sm" aria-label="Diagnostic système">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gold-soft/50">
            <Activity className="size-5 text-gold-deep" />
          </span>
          <div>
            <h2 className="font-display text-lg text-foreground">Tests & diagnostic système</h2>
            <p className="text-sm text-muted-foreground">Vérifications automatiques des modules audit, RBAC, CRM et animations.</p>
          </div>
        </div>
        <span className={`health-panel-status ${passed ? "health-panel-status--ok" : "health-panel-status--fail"}`}>
          {passed ? "Tous les tests OK" : "Anomalie détectée"}
        </span>
      </div>
      <ul className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {checks.map((check) => (
          <li
            key={check.id}
            className={`health-check-card ${check.ok ? "health-check-card--ok" : "health-check-card--fail"}`}
          >
            <div className="flex items-start gap-3">
              {check.ok ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
              ) : (
                <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden />
              )}
              <div className="min-w-0">
                <p className="font-medium text-foreground">{check.label}</p>
                <p className="mt-1 truncate text-sm text-muted-foreground" title={check.detail}>{check.detail}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {check.ok ? "Réussi" : "Échec"}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
