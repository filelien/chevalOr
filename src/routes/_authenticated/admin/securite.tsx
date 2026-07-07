import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Key, ScrollText, Users, Monitor } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/securite")({
  component: AdminSecurite,
});

const CARDS = [
  { title: "Rôles & permissions", desc: "Matrice RBAC granulaire", to: "/admin/roles", Icon: Shield },
  { title: "Utilisateurs", desc: "Comptes staff & statuts", to: "/admin/utilisateurs", Icon: Users },
  { title: "Journal d'audit", desc: "Traçabilité complète", to: "/admin/activite", Icon: ScrollText },
  { title: "Surveillance", desc: "Connexions & alertes", to: "/admin/surveillance", Icon: Monitor },
  { title: "Paramètres sécurité", desc: "MFA, sessions, politiques", to: "/admin/parametres", Icon: Lock },
];

function AdminSecurite() {
  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminPageHeader
        label="Administration · Sécurité"
        title="Centre de sécurité"
        subtitle="RBAC, audit, surveillance des accès et conformité."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(({ title, desc, to, Icon }) => (
          <Link key={to} to={to as "/admin"} className="security-hub-card group rounded-xl border border-border bg-card p-6 shadow-sm transition hover:border-gold-deep/40 hover:shadow-elegant">
            <Icon className="size-10 text-gold-deep transition group-hover:scale-110" />
            <h3 className="mt-4 font-display text-xl">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            <span className="mt-4 inline-block text-sm text-gold-deep">Accéder →</span>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <Key className="size-6 text-amber-700 shrink-0" />
          <div>
            <h3 className="font-medium text-amber-900">Bonnes pratiques</h3>
            <ul className="mt-2 space-y-1 text-sm text-amber-800">
              <li>• Révisez les permissions chaque trimestre</li>
              <li>• Consultez le journal d'audit après chaque modification sensible</li>
              <li>• Suspendez immédiatement les comptes inactifs</li>
            </ul>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link to="/admin/activite">Ouvrir le journal d'audit</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
