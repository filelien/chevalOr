import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/campagnes")({
  component: CampagnesPage,
});

function CampagnesPage() {
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Marketing"
        title="Campagnes email"
        subtitle="Newsletter et promotions ciblées — connectez Resend dans Paramètres."
      />
      <div className="rounded-xl border border-border bg-card p-8">
        <p className="text-muted-foreground">
          Les abonnés newsletter sont gérés dans <Link to="/admin/messages" className="text-gold-deep underline">Messages → Newsletter</Link>.
          Configurez <code className="text-xs">RESEND_API_KEY</code> sur Vercel pour envoyer des campagnes.
        </p>
        <Button className="mt-6" variant="hero" asChild>
          <Link to="/admin/marketing">Gérer les codes promo</Link>
        </Button>
      </div>
    </div>
  );
}
