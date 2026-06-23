import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { fetchGalleryItems, saveGalleryItem, deleteGalleryItem } from "@/lib/gallery-admin";
import { uploadGalleryFile } from "@/lib/media-upload";
import { Plus, Trash2, Eye, EyeOff, Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/galerie")({
  component: AdminGallery,
});

function AdminGallery() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-gallery"], queryFn: () => fetchGalleryItems(true) });
  const [form, setForm] = useState({ title: "", category: "Hôtel", url: "", sort_order: 0, is_published: true, media_type: "image" });

  const [uploading, setUploading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadGalleryFile(file);
      setForm((f) => ({ ...f, url, title: f.title || file.name }));
      toast.success("Fichier uploadé");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur upload — vérifiez le bucket gallery");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    try {
      await saveGalleryItem(form);
      toast.success("Média ajouté");
      setForm({ title: "", category: "Hôtel", url: "", sort_order: 0, is_published: true, media_type: "image" });
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur — appliquez la migration Supabase si les tables n'existent pas");
    }
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <AdminPageHeader label="Médias" title="Galerie multimédia" subtitle="Photos, vidéos et documents classés par catégories pour le site public." />

      <div className="rounded-xl border border-border bg-card p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <input placeholder="Titre" className="rounded-md border px-3 py-2" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        <input placeholder="Catégorie" className="rounded-md border px-3 py-2" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
        <input placeholder="URL image/vidéo" className="rounded-md border px-3 py-2 sm:col-span-2" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm">
          <Upload className="size-4" />
          {uploading ? "Upload…" : "Glisser / choisir fichier"}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
        <Button variant="hero" onClick={save}><Plus className="mr-1 size-4" />Ajouter</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-xl border border-border bg-card">
            {item.media_type === "image" && item.url && (
              <img src={item.url} alt={item.title} className="aspect-video w-full object-cover" />
            )}
            <div className="p-4 flex justify-between items-start">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => saveGalleryItem({ ...item, is_published: !item.is_published }).then(() => qc.invalidateQueries({ queryKey: ["admin-gallery"] }))}>
                  {item.is_published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteGalleryItem(item.id).then(() => qc.invalidateQueries({ queryKey: ["admin-gallery"] }))}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
