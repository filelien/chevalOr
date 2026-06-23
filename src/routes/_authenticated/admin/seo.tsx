import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { getSiteSetting, setSiteSetting } from "@/lib/site-settings";

export const Route = createFileRoute("/_authenticated/admin/seo")({
  component: AdminSeo,
});

type SeoHome = { title: string; description: string; keywords: string };

function AdminSeo() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["site-seo"],
    queryFn: () =>
      getSiteSetting<SeoHome>("seo_home", {
        title: "Hôtel Le Cheval d'Or — Anié, Togo",
        description: "Hôtel à Anié : chambres, restaurant, salle de conférence.",
        keywords: "hôtel Anié, Togo, séminaire, conférence",
      }),
  });

  const [form, setForm] = useState<SeoHome>({ title: "", description: "", keywords: "" });
  useEffect(() => { if (data) setForm(data); }, [data]);

  async function save() {
    try {
      await setSiteSetting("seo_home", form);
      toast.success("SEO enregistré");
      qc.invalidateQueries({ queryKey: ["site-seo"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader
        label="Référencement"
        title="SEO"
        subtitle="Meta title, description et mots-clés pour la page d'accueil."
      />

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <label className="block text-sm">
          <span className="text-muted-foreground">Meta title</span>
          <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <span className="text-xs text-muted-foreground">{form.title.length}/60 caractères recommandés</span>
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">Meta description</span>
          <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">Mots-clés</span>
          <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.keywords} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))} />
        </label>
        <Button variant="hero" onClick={save}>Enregistrer</Button>
      </div>

      <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        <p><strong>Sitemap :</strong> généré automatiquement par TanStack Router à <code>/sitemap.xml</code> (à configurer en production).</p>
        <p className="mt-2"><strong>Google Analytics :</strong> ajoutez votre ID de mesure dans Paramètres.</p>
      </div>
    </div>
  );
}
