import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { getSiteSetting, setSiteSetting } from "@/lib/site-settings";
import { MediaPicker } from "@/components/admin/media/MediaPicker";

export const Route = createFileRoute("/_authenticated/admin/seo")({
  component: AdminSeo,
});

type SeoHome = { title: string; description: string; keywords: string; ogImage?: string };

function AdminSeo() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["site-seo"],
    queryFn: () =>
      getSiteSetting<SeoHome>("seo_home", {
        title: "Hôtel Le Cheval d'Or — Anié, Togo",
        description: "Hôtel à Anié : chambres, restaurant, salle de conférence.",
        keywords: "hôtel Anié, Togo, séminaire, conférence",
        ogImage: "",
      }),
  });

  const [form, setForm] = useState<SeoHome>({ title: "", description: "", keywords: "", ogImage: "" });
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
        title="SEO & partage social"
        subtitle="Meta title, description, mots-clés et image Open Graph pour Google et les réseaux sociaux."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-display text-xl">Balises meta</h2>
          <label className="block text-sm">
            <span className="text-muted-foreground">Meta title</span>
            <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <span className={`text-xs ${form.title.length > 60 ? "text-amber-600" : "text-muted-foreground"}`}>
              {form.title.length}/60 caractères recommandés
            </span>
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">Meta description</span>
            <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <span className={`text-xs ${form.description.length > 160 ? "text-amber-600" : "text-muted-foreground"}`}>
              {form.description.length}/160 caractères recommandés
            </span>
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">Mots-clés</span>
            <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.keywords} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))} />
          </label>
          <MediaPicker
            label="Image Open Graph (partage Facebook, WhatsApp…)"
            value={form.ogImage ?? ""}
            onChange={(url) => setForm((f) => ({ ...f, ogImage: url }))}
          />
          <Button variant="hero" onClick={save}>Enregistrer</Button>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aperçu Google</p>
            <div className="mt-4 space-y-1">
              <p className="text-lg text-blue-700 line-clamp-1">{form.title || "Titre de la page"}</p>
              <p className="text-sm text-emerald-700">cheval-or.vercel.app</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{form.description || "Description…"}</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <p className="border-b border-border px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aperçu réseaux sociaux</p>
            {form.ogImage ? (
              <img src={form.ogImage} alt="" className="aspect-[1.91/1] w-full object-cover" />
            ) : (
              <div className="flex aspect-[1.91/1] items-center justify-center bg-secondary text-sm text-muted-foreground">Ajoutez une image OG</div>
            )}
            <div className="p-4">
              <p className="font-medium line-clamp-1">{form.title}</p>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{form.description}</p>
            </div>
          </div>
          <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            <p><strong>Sitemap :</strong> <code>/sitemap.xml</code> — généré dynamiquement.</p>
            <p className="mt-2"><strong>Analytics :</strong> configurez l'ID dans Paramètres → Intégrations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
