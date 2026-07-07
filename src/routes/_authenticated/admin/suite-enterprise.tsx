import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Building2, Globe, BarChart3, Shield, Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/suite-enterprise")({
  component: SuiteEnterprise,
});

const MODULES = [
  { title: "Multi-établissements", desc: "Gérez plusieurs hôtels depuis un seul tableau de bord", status: "Bientôt", Icon: Building2 },
  { title: "API & Webhooks", desc: "Intégrations channel manager, OTA, comptabilité", status: "Partiel", Icon: Zap },
  { title: "Business Intelligence", desc: "Rapports avancés & prévisions IA", status: "Actif", Icon: BarChart3, to: "/admin/rapports" },
  { title: "Conformité RGPD", desc: "Audit, rétention données, export client", status: "Actif", Icon: Shield, to: "/admin/activite" },
  { title: "Site multi-langue", desc: "FR / EN / Ewe — contenu CMS", status: "En cours", Icon: Globe, to: "/admin/site-web" },
];

function SuiteEnterprise() {
  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminPageHeader
        label="Administration · Enterprise"
        title="Suite Enterprise"
        subtitle="Modules avancés pour la croissance et l'interopérabilité hôtelière."
      />

      <div className="enterprise-hero rounded-xl bg-gradient-to-br from-onyx via-slate-800 to-amber-900/40 p-8 text-white shadow-elegant">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-soft/80">Le Cheval d'Or ERP</p>
        <h2 className="mt-2 font-display text-3xl">Plateforme hôtelière tout-en-un</h2>
        <p className="mt-2 max-w-xl text-white/70">PMS + CRM + CMS + Finance + Marketing — prêt pour le déploiement multi-sites en Afrique de l'Ouest.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {MODULES.map(({ title, desc, status, Icon, to }) => (
          <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <Icon className="size-8 text-gold-deep" />
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                status === "Actif" ? "bg-emerald-100 text-emerald-800" :
                status === "Partiel" ? "bg-amber-100 text-amber-800" : "bg-secondary text-muted-foreground"
              }`}>{status}</span>
            </div>
            <h3 className="mt-3 font-display text-xl">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            {to && (
              <Link to={to as "/admin"} className="mt-4 inline-block text-sm text-gold-deep hover:underline">
                Accéder →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
