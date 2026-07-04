import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckSquare, Copy, Eye, EyeOff, ExternalLink, Grid3X3, ImageIcon, LayoutList, Pencil,
  Search, Star, Trash2, Upload, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchGalleryItems, saveGalleryItem, deleteGalleryItem,
  filterGalleryItems, getMediaExtension, getMediaFileName, GALLERY_CATEGORIES,
  sortGalleryItems, type GalleryItem, type MediaSortBy,
} from "@/lib/gallery-admin";
import { uploadGalleryFile } from "@/lib/media-upload";
import { EditableImage } from "./EditableImage";

type ViewMode = "grid" | "list";

type UploadProgress = {
  completed: number;
  total: number;
};

const EMPTY_FORM = {
  title: "",
  category: GALLERY_CATEGORIES[0],
  url: "",
  sort_order: 0,
  is_published: true,
  media_type: "image",
  author: "",
  alt_text: "",
  description: "",
  tags: [] as string[],
  is_favorite: false,
};

export function MediaLibrary({ compact = false }: { compact?: boolean }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [published, setPublished] = useState<"all" | "published" | "draft">("all");
  const [mediaType, setMediaType] = useState<"all" | "image" | "video" | "file">("all");
  const [sortBy, setSortBy] = useState<MediaSortBy>("recent");
  const [view, setView] = useState<ViewMode>("grid");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ completed: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: () => fetchGalleryItems(true),
  });

  const filtered = useMemo(
    () => sortGalleryItems(filterGalleryItems(items, {
      search,
      category,
      published,
      mediaType,
      favorite: favoritesOnly,
      tags: tagFilter,
    }), sortBy),
    [items, search, category, published, mediaType, sortBy, favoritesOnly, tagFilter],
  );

  const stats = useMemo(() => ({
    total: items.length,
    published: items.filter((i) => i.is_published).length,
    draft: items.filter((i) => !i.is_published).length,
    favorites: items.filter((i) => i.is_favorite).length,
  }), [items]);

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) =>
      f.type.startsWith("image/") || f.type.startsWith("video/") || f.type === "application/pdf",
    );
    if (!list.length) {
      toast.error("Sélectionnez des images, vidéos ou documents valides.");
      return;
    }

    setUploading(true);
    setUploadProgress({ completed: 0, total: list.length });

    try {
      for (let index = 0; index < list.length; index += 1) {
        const file = list[index];
        const url = await uploadGalleryFile(file);
        const media_type = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
            ? "video"
            : "file";

        await saveGalleryItem({
          title: file.name.replace(/\.[^.]+$/, ""),
          category: GALLERY_CATEGORIES[0],
          url,
          media_type,
          sort_order: items.length + index,
          is_published: true,
          file_size: file.size,
          author: "",
          tags: [],
          metadata: { mime_type: file.type },
        });

        setUploadProgress((prev) => ({
          ...prev,
          completed: prev.completed + 1,
        }));
      }

      toast.success(`${list.length} média(s) ajouté(s)`);
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur d'upload");
    } finally {
      setUploading(false);
      setUploadProgress({ completed: 0, total: 0 });
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function togglePublish(item: GalleryItem) {
    await saveGalleryItem({ ...item, is_published: !item.is_published });
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    toast.success(item.is_published ? "Média masqué" : "Média publié");
  }

  async function toggleFavorite(item: GalleryItem) {
    await saveGalleryItem({ ...item, is_favorite: !item.is_favorite });
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    toast.success(item.is_favorite ? "Favori retiré" : "Favori ajouté");
  }

  async function remove(item: GalleryItem) {
    if (!confirm(`Supprimer « ${item.title} » ?`)) return;
    await deleteGalleryItem(item.id, item.url);
    toast.success("Média supprimé");
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
  }

  async function saveEdit() {
    if (!editing) return;
    await saveGalleryItem({
      ...editing,
      ...form,
      tags: form.tags,
    });
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
      author: item.author ?? "",
      alt_text: item.alt_text ?? "",
      description: item.description ?? "",
      tags: item.tags ?? [],
      is_favorite: item.is_favorite ?? false,
    });
  }

  function toggleSelection(id: string) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  async function bulkUpdatePublished(publish: boolean) {
    if (!selectedIds.length) return;
    await Promise.all(selectedIds.map(async (id) => {
      const item = items.find((media) => media.id === id);
      if (item) await saveGalleryItem({ ...item, is_published: publish });
    }));
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    toast.success(publish ? "Éléments publiés" : "Éléments masqués");
    clearSelection();
  }

  async function bulkDelete() {
    if (!selectedIds.length || !confirm(`Supprimer ${selectedIds.length} médias sélectionnés ?`)) return;
    await Promise.all(selectedIds.map(async (id) => {
      const item = items.find((media) => media.id === id);
      if (item) await deleteGalleryItem(item.id, item.url);
    }));
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    toast.success(`${selectedIds.length} média(s) supprimé(s)`);
    clearSelection();
  }

  async function bulkToggleFavorite(favorite: boolean) {
    if (!selectedIds.length) return;
    await Promise.all(selectedIds.map(async (id) => {
      const item = items.find((media) => media.id === id);
      if (item) await saveGalleryItem({ ...item, is_favorite: favorite });
    }));
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    toast.success(favorite ? "Éléments marqués favoris" : "Éléments retirés des favoris");
    clearSelection();
  }

  const selectedCount = selectedIds.length;

  const hasFilters = !!(search || category !== "all" || mediaType !== "all" || published !== "all" || tagFilter || favoritesOnly);

  return (
    <div className="space-y-6">
      {!compact && (
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Total médias" value={stats.total.toString()} />
          <StatCard label="Publiés" value={stats.published.toString()} accent />
          <StatCard label="Brouillons" value={stats.draft.toString()} warning />
          <StatCard label="Favoris" value={stats.favorites.toString()} />
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
        <Upload className="mx-auto size-12 text-gold-deep" />
        <p className="mt-3 text-xl font-semibold">Glissez vos fichiers ici</p>
        <p className="mt-1 text-sm text-muted-foreground">Images, vidéos, PDF — upload multiple et métadonnées.</p>
        <Button className="mt-4" variant="hero" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? `Upload ${uploadProgress.completed}/${uploadProgress.total}` : "Choisir des fichiers"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && void handleFiles(e.target.files)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-3 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre, auteur, tag, description…"
          />
        </div>

        <select className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">Toutes catégories</option>
          {GALLERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm" value={mediaType} onChange={(e) => setMediaType(e.target.value as typeof mediaType)}>
          <option value="all">Tous formats</option>
          <option value="image">Images</option>
          <option value="video">Vidéos</option>
          <option value="file">Documents</option>
        </select>

        <select className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm" value={published} onChange={(e) => setPublished(e.target.value as typeof published)}>
          <option value="all">Tous statuts</option>
          <option value="published">Publiés</option>
          <option value="draft">Brouillons</option>
        </select>

        <select className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value as MediaSortBy)}>
          <option value="recent">Récent d&apos;abord</option>
          <option value="title">Titre A → Z</option>
          <option value="category">Catégorie</option>
          <option value="order">Ordre manuel</option>
          <option value="favorite">Favoris</option>
          <option value="usage">Usage</option>
          <option value="size">Taille</option>
        </select>

        <div className="space-y-2">
          <input
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
            placeholder="Filtrer par tag"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={favoritesOnly} onChange={(e) => setFavoritesOnly(e.target.checked)} />
            Favoris uniquement
          </label>
        </div>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-secondary/20 p-3 text-sm">
          <span className="font-semibold text-muted-foreground">Filtres actifs :</span>
          {search && <Badge label={`Recherche: ${search}`} onRemove={() => setSearch("")} />}
          {category !== "all" && <Badge label={`Catégorie: ${category}`} onRemove={() => setCategory("all")} />}
          {mediaType !== "all" && <Badge label={`Format: ${mediaType}`} onRemove={() => setMediaType("all")} />}
          {published !== "all" && <Badge label={`Statut: ${published}`} onRemove={() => setPublished("all")} />}
          {tagFilter && <Badge label={`Tag: ${tagFilter}`} onRemove={() => setTagFilter("")} />}
          {favoritesOnly && <Badge label="Favoris" onRemove={() => setFavoritesOnly(false)} />}
          <button type="button" onClick={() => { setSearch(""); setCategory("all"); setMediaType("all"); setPublished("all"); setTagFilter(""); setFavoritesOnly(false); setSortBy("recent"); }} className="text-xs text-muted-foreground underline">Réinitialiser</button>
        </div>
      )}

      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-foreground">{selectedCount} média(s) sélectionné(s)</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => void bulkUpdatePublished(true)}>Publier</Button>
            <Button size="sm" variant="outline" onClick={() => void bulkUpdatePublished(false)}>Masquer</Button>
            <Button size="sm" variant="outline" onClick={() => void bulkToggleFavorite(true)}>Favoris</Button>
            <Button size="sm" variant="outline" onClick={() => void bulkToggleFavorite(false)}>Retirer favoris</Button>
            <Button size="sm" variant="destructive" onClick={() => void bulkDelete()}>Supprimer</Button>
            <Button size="sm" variant="ghost" onClick={clearSelection}>Annuler</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-border border-t-gold-deep" />
          <p className="text-muted-foreground">Chargement de la médiathèque…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-secondary/20 py-20 text-center">
          <ImageIcon className="mx-auto size-16 text-muted-foreground/30" />
          <p className="mt-6 text-lg font-semibold">Aucun média trouvé</p>
          <p className="mt-2 text-sm text-muted-foreground">Essayez de modifier vos filtres ou importer de nouveaux fichiers.</p>
        </div>
      ) : view === "grid" ? (
        <div className="media-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              selected={selectedIds.includes(item.id)}
              onToggleSelect={() => toggleSelection(item.id)}
              onEdit={() => openEdit(item)}
              onToggle={() => void togglePublish(item)}
              onToggleFavorite={() => void toggleFavorite(item)}
              onDelete={() => void remove(item)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="audit-table w-full text-sm">
            <thead className="bg-[#f8f6f1] text-left text-[11px] font-bold uppercase tracking-widest text-foreground/70">
              <tr>
                <th className="p-3 w-12">Sélection</th>
                <th className="p-3">Aperçu</th>
                <th className="p-3">Titre</th>
                <th className="p-3">Détails</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-border/50 hover:bg-secondary/20 transition">
                  <td className="p-3">
                    <button type="button" onClick={() => toggleSelection(item.id)} className="rounded border border-input bg-background p-2">
                      {selectedIds.includes(item.id) ? <CheckSquare className="size-4 text-gold-deep" /> : <span className="size-4" />}
                    </button>
                  </td>
                  <td className="p-3 w-28">
                    <div className="w-20 h-20">
                      <EditableImage src={item.url} alt={item.title} className="rounded-md" onChange={async (url) => {
                        try {
                          await saveGalleryItem({ ...item, url });
                          toast.success("Image mise à jour");
                          qc.invalidateQueries({ queryKey: ["admin-gallery"] });
                        } catch (e: any) { toast.error(e.message); }
                      }} />
                    </div>
                  </td>
                  <td className="p-3 font-medium text-foreground">{item.title}</td>
                  <td className="p-3 text-xs text-muted-foreground space-y-1">
                    <div>Type: {getMediaExtension(item)}</div>
                    <div>Catégorie: {item.category}</div>
                    <div>Tags: {(item.tags ?? []).slice(0, 3).join(", ") || "—"}</div>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${item.is_published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {item.is_published ? "✅ Publié" : "📝 Brouillon"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1.5 flex-wrap">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(item)} title="Modifier"><Pencil className="size-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(item.url); toast.success("URL copiée"); }} title="Copier URL"><Copy className="size-4" /></Button>
                      <Button size="sm" variant="ghost" asChild title="Ouvrir"><a href={item.url} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /></a></Button>
                      <Button size="sm" variant="ghost" onClick={() => void toggleFavorite(item)} title={item.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}>
                        <Star className={`size-4 ${item.is_favorite ? "text-yellow-500" : "text-muted-foreground"}`} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => void togglePublish(item)} title={item.is_published ? "Masquer" : "Publier"}>
                        {item.is_published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => void remove(item)} title="Supprimer"><Trash2 className="size-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le média</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-6">
              {editing.url && <img src={editing.url} alt={editing.title} className="w-full rounded-xl object-cover" />}
              <div className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="text-muted-foreground">Titre</span>
                    <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                  </label>
                  <label className="text-sm">
                    <span className="text-muted-foreground">Catégorie</span>
                    <select className="mt-1 w-full rounded-md border px-3 py-2" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                      {GALLERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="text-muted-foreground">Auteur</span>
                    <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.author ?? ""} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
                  </label>
                  <label className="text-sm">
                    <span className="text-muted-foreground">Texte alternatif</span>
                    <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.alt_text ?? ""} onChange={(e) => setForm((f) => ({ ...f, alt_text: e.target.value }))} />
                  </label>
                </div>
                <label className="text-sm">
                  <span className="text-muted-foreground">Description</span>
                  <textarea rows={4} className="mt-1 w-full rounded-md border px-3 py-2" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </label>
                <label className="text-sm">
                  <span className="text-muted-foreground">Tags (virgule séparée)</span>
                  <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.tags?.join(", ") ?? ""} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) }))} />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="text-muted-foreground">Ordre d&apos;affichage</span>
                    <input type="number" className="mt-1 w-full rounded-md border px-3 py-2" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} />
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border border-input bg-background px-3 py-3 text-sm">
                    <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} />
                    <span>Publier ce média</span>
                  </label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
            <Button variant="hero" onClick={() => void saveEdit()}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MediaCard({
  item,
  selected,
  onToggleSelect,
  onEdit,
  onToggle,
  onToggleFavorite,
  onDelete,
}: {
  item: GalleryItem;
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onToggle: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}) {
  return (
    <article className={`media-card group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-gold-deep/30 hover:shadow-lg ${selected ? "border-gold-deep/60 bg-gold-soft/10" : ""}`}>
      <button type="button" onClick={onToggleSelect} className="absolute right-3 top-3 z-10 rounded-full border border-border bg-background p-2 shadow-sm">
        <CheckSquare className={`size-4 ${selected ? "text-gold-deep" : "text-muted-foreground"}`} />
      </button>
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img src={item.url} alt={item.title} className="size-full object-cover transition group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
          <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${item.is_published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
            {item.is_published ? "✅ Publié" : "📝 Brouillon"}
          </span>
          {item.is_favorite && <Star className="size-4 text-yellow-400" />}
        </div>
      </div>
      <div className="p-4">
        <div className="mb-3">
          <p className="font-semibold text-sm truncate" title={item.title}>{item.title}</p>
          <p className="text-xs text-muted-foreground mt-1 truncate" title={getMediaFileName(item)}>{getMediaFileName(item)}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground mb-4 bg-secondary/30 rounded-xl p-2">
          <div>Format: {getMediaExtension(item)}</div>
          <div>Auteur: {item.author ?? "—"}</div>
          <div>Usage: {item.usage_count ?? 0}</div>
          <div>Tags: {(item.tags ?? []).slice(0, 3).join(", ") || "—"}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={onEdit} className="flex-1 text-xs">Modifier</Button>
          <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(item.url); toast.success("URL copiée"); }} className="flex-1 text-xs">URL</Button>
          <Button size="sm" variant="outline" asChild className="flex-1 text-xs"><a href={item.url} target="_blank" rel="noreferrer">Voir</a></Button>
          <Button size="sm" variant="outline" onClick={onToggleFavorite} className="text-xs">
            <Star className={`size-4 ${item.is_favorite ? "text-yellow-500" : "text-muted-foreground"}`} />
          </Button>
          <Button size="sm" variant="outline" onClick={onToggle} className="text-xs">{item.is_published ? "Masquer" : "Publier"}</Button>
          <Button size="sm" variant="outline" onClick={onDelete} className="text-xs text-destructive">Supprimer</Button>
        </div>
      </div>
    </article>
  );
}

function Badge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs text-foreground shadow-sm">
      {label}
      <button type="button" onClick={onRemove} className="text-muted-foreground hover:text-foreground"><X className="size-3" /></button>
    </span>
  );
}

function StatCard({ label, value, accent, warning }: { label: string; value: string; accent?: boolean; warning?: boolean }) {
  return (
    <div className={`stat-card-premium rounded-xl p-5 ${accent ? "accent" : warning ? "bg-amber-50" : "bg-card"}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-2 font-display text-3xl tabular-nums ${accent ? "text-emerald-700" : warning ? "text-amber-700" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
