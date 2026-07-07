import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader, StatCard } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fetchPromoCodes } from "@/lib/marketing";
import { Mail, Users, Send, Megaphone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/campagnes")({
  component: CampagnesPage,
});

function CampagnesPage() {
  const [subject, setSubject] = useState("Offres exclusives — Hôtel Le Cheval d'Or");
  const [body, setBody] = useState("Découvrez nos chambres, restaurant et offres séminaire à Anié.\n\nRéservez sur notre site.");

  const { data: subscribers = [] } = useQuery({
    queryKey: ["admin-newsletter"],
    queryFn: async () => {
      const { data, error } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: promos = [] } = useQuery({ queryKey: ["admin-promos"], queryFn: fetchPromoCodes });

  function copyCampaign() {
    const text = `Objet: ${subject}\n\n${body}\n\n---\nAbonnés: ${subscribers.length}`;
    navigator.clipboard.writeText(text);
    toast.success("Brouillon copié — collez dans Resend ou votre outil email");
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Marketing"
        title="Campagnes email"
        subtitle="Composez des newsletters, ciblez les abonnés et associez des codes promo."
      >
        <Button variant="hero" size="sm" onClick={copyCampaign}>
          <Send className="mr-1 size-4" />Copier le brouillon
        </Button>
      </AdminPageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Abonnés newsletter" value={subscribers.length} Icon={Users} accent />
        <StatCard label="Codes promo actifs" value={promos.filter((p) => p.is_active).length} Icon={Megaphone} />
        <StatCard label="Envoi" value="Resend" Icon={Mail} hint="Configurez RESEND_API_KEY sur Vercel" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="font-display text-xl">Composer une campagne</h2>
          <label className="block text-sm">
            <span className="text-muted-foreground">Objet</span>
            <input className="mt-1 w-full rounded-md border px-3 py-2" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">Corps du message</span>
            <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
          </label>
          {promos[0] && (
            <p className="text-sm text-muted-foreground">
              Code suggéré : <span className="font-mono font-semibold text-gold-deep">{promos[0].code}</span> (−{promos[0].discount_percent}%)
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="hero" onClick={copyCampaign}>Préparer l'envoi</Button>
            <Button variant="outline" asChild><Link to="/admin/messages">Voir les abonnés</Link></Button>
            <Button variant="outline" asChild><Link to="/admin/marketing">Codes promo</Link></Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-display text-xl">Abonnés récents</h2>
            <p className="text-sm text-muted-foreground">{subscribers.length} contact(s)</p>
          </div>
          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {subscribers.length === 0 ? (
              <li className="p-8 text-center text-sm text-muted-foreground">Aucun abonné pour le moment.</li>
            ) : subscribers.slice(0, 20).map((s: any) => (
              <li key={s.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span>{s.email}</span>
                <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString("fr-FR")}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
