import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Copy, Eye, EyeOff, Grid3X3, ImageIcon, LayoutList, Pencil,
  Search, Trash2, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchGalleryItems, saveGalleryItem, deleteGalleryItem,
  filterGalleryItems, GALLERY_CATEGORIES, type GalleryItem,
} from "@/lib/gallery-admin";
import { uploadGalleryFiles } from "@/lib/media-upload";

type ViewMode = "grid" | "list";

const EMPTY_FORM = {
  title: "",
  category: GALLERY_CATEGORIES[0],
  url: "",
  sort_order: 0,
  is_published: true,
  media_type: "image",
};

export function MediaLibrary({ compact = false }: { compact?: boolean }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [published, setPublished] = useState<"all" | "published" | "draft">("all");
  const [view, setView] = useState<ViewMode>("grid");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: () => fetchGalleryItems(true),
  });

  const filtered = useMemo(
    () => filterGalleryItems(items, { search, category, published }),
    [items, search, category, published],
  );

  const stats = useMemo(() => ({
    total: items.length,
    published: items.filter((i) => i.is_published).length,
    draft: items.filter((i) => !i.is_published).length,
  }), [items]);

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) {
      toast.error("Sélectionnez des images (JPEG, PNG, WebP)");
      return;
    }
    setUploading(true);
    try {
      const urls = await uploadGalleryFiles(list);
      for (let i = 0; i < urls.length; i++) {
        const file = list[i];
        await saveGalleryItem({
          title: file.name.replace(/\.[^.]+$/, ""),
          category: GALLERY_CATEGORIES[0],
          url: urls[i],
          media_type: "image",
          sort_order: items.length + i,
          is_published: true,
        });
      }
      toast.success(`${urls.length} média(s) ajouté(s)`);
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur d'upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function togglePublish(item: GalleryItem) {
    await saveGalleryItem({ ...item, is_published: !item.is_published });
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
  }

  async function remove(item: GalleryItem) {
    if (!confirm(`Supprimer « ${item.title} » ?`)) return;
    await deleteGalleryItem(item.id, item.url);
    toast.success("Média supprimé");
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
  }

  async function saveEdit() {
    if (!editing) return;
    await saveGalleryItem({ ...editing, ...form });
    toast.success("Média mis à jour");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
  }

  function openEdit(item: GalleryItem) {
    setEditing(item);
    setForm({
      title: item.title,
      category: item.category,
      url: item.url,
      sort_order: item.sort_order,
      is_published: item.is_published,
      media_type: item.media_type,
    });
  }

  return (
    <div className="space-y-6">
      {!compact && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="stat-card-premium rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total médias</p>
            <p className="mt-2 font-display text-3xl tabular-nums">{stats.total}</p>
          </div>
          <div className="stat-card-premium accent rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Publiés</p>
            <p className="mt-2 font-display text-3xl tabular-nums text-emerald-700">{stats.published}</p>
          </div>
          <div className="stat-card-premium rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brouillons</p>
            <p className="mt-2 font-display text-3xl tabular-nums text-amber-700">{stats.draft}</p>
          </div>
        </div>
      )}

      <div
        className={`media-dropzone rounded-xl border-2 border-dashed p-8 text-center transition ${dragOver ? "border-gold-deep bg-gold-soft/20" : "border-border bg-card"}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) void handleFiles(e.dataTransfer.files);
        }}
      >
        <Upload className="mx-auto size-10 text-gold-deep" />
        <p className="mt-3 font-medium">Glissez vos photos ici</p>
        <p className="mt-1 text-sm text-muted-foreground">JPEG, PNG, WebP — max 10 Mo par fichier</p>
        <Button className="mt-4" variant="hero" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? "Upload en cours…" : "Choisir des fichiers"}
        </Button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
          onChange={(e) => e.target.files && void handleFiles(e.target.files)} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un média…"
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-9 pr-3 text-sm"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm">
          <option value="all">Toutes catégories</option>
          {GALLERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={published} onChange={(e) => setPublished(e.target.value as typeof published)} className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm">
          <option value="all">Tous statuts</option>
          <option value="published">Publiés</option>
          <option value="draft">Brouillons</option>
        </select>
        <div className="flex rounded-lg border border-border">
          <button type="button" onClick={() => setView("grid")} className={`p-2.5 ${view === "grid" ? "bg-gold-soft/40 text-gold-deep" : "text-muted-foreground"}`} aria-label="Vue grille">
            <Grid3X3 className="size-4" />
          </button>
          <button type="button" onClick={() => setView("list")} className={`p-2.5 ${view === "list" ? "bg-gold-soft/40 text-gold-deep" : "text-muted-foreground"}`} aria-label="Vue liste">
            <LayoutList className="size-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-muted-foreground">Chargement de la médiathèque…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <ImageIcon className="mx-auto size-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">Aucun média trouvé. Uploadez votre première photo.</p>
        </div>
      ) : view === "grid" ? (
        <div className="media-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <MediaCard key={item.id} item={item} onEdit={() => openEdit(item)} onToggle={() => void togglePublish(item)} onDelete={() => void remove(item)} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="audit-table w-full text-sm">
            <thead className="bg-[#f8f6f1] text-left text-[11px] font-bold uppercase tracking-widest text-foreground/70">
              <tr>
                <th className="p-3">Aperçu</th>
                <th className="p-3">Titre</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-border/50">
                  <td className="p-3">
                    <img src={item.url} alt="" className="size-14 rounded-lg object-cover" />
                  </td>
                  <td className="p-3 font-medium">{item.title}</td>
                  <td className="p-3 text-muted-foreground">{item.category}</td>
                  <td className="p-3">
                    <span className={item.is_published ? "audit-badge audit-badge--success" : "audit-badge audit-badge--muted"}>
                      {item.is_published ? "PUBLIÉ" : "BROUILLON"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(item)}><Pencil className="size-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => void togglePublish(item)}>
                        {item.is_published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => void remove(item)}><Trash2 className="size-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le média</DialogTitle>
          </DialogHeader>
          {editing?.url && (
            <img src={editing.url} alt="" className="aspect-video w-full rounded-lg object-cover" />
          )}
          <div className="grid gap-3">
            <label className="text-sm">
              <span className="text-muted-foreground">Titre</span>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">Catégorie</span>
              <select className="mt-1 w-full rounded-md border px-3 py-2" value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {GALLERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">Ordre d'affichage</span>
              <input type="number" className="mt-1 w-full rounded-md border px-3 py-2" value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_published}
                onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} />
              Visible sur le site public
            </label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
            <Button variant="hero" onClick={() => void saveEdit()}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MediaCard({
  item, onEdit, onToggle, onDelete,
}: {
  item: GalleryItem;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="media-card group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-gold-deep/30 hover:shadow-elegant">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img src={item.url} alt={item.title} className="size-full object-cover transition group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
          <span className={`audit-badge ${item.is_published ? "audit-badge--success" : "audit-badge--muted"}`}>
            {item.is_published ? "PUBLIÉ" : "BROUILLON"}
          </span>
        </div>
      </div>
      <div className="p-4">
        <p className="font-medium truncate" title={item.title}>{item.title}</p>
        <p className="text-xs text-muted-foreground">{item.category}</p>
        <div className="mt-3 flex gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit} title="Modifier"><Pencil className="size-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(item.url); toast.success("URL copiée"); }} title="Copier URL">
            <Copy className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onToggle} title={item.is_published ? "Masquer" : "Publier"}>
            {item.is_published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} title="Supprimer"><Trash2 className="size-4 text-destructive" /></Button>
        </div>
      </div>
    </article>
  );
}
