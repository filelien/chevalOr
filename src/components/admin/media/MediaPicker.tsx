import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ImageIcon, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  fetchGalleryItems, saveGalleryItem, filterGalleryItems, GALLERY_CATEGORIES,
} from "@/lib/gallery-admin";
import { uploadGalleryFile } from "@/lib/media-upload";

type MediaPickerProps = {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  triggerLabel?: string;
};

/** Sélecteur d'image depuis la médiathèque (CMS, SEO, chambres…). */
export function MediaPicker({ value, onChange, label = "Image", triggerLabel = "Choisir depuis la médiathèque" }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: () => fetchGalleryItems(true),
    enabled: open,
  });

  const filtered = useMemo(
    () => filterGalleryItems(items, { search, category }),
    [items, search, category],
  );

  async function quickUpload(file: File) {
    setUploading(true);
    try {
      const url = await uploadGalleryFile(file);
      await saveGalleryItem({
        title: file.name.replace(/\.[^.]+$/, ""),
        category: GALLERY_CATEGORIES[0],
        url,
        media_type: "image",
        sort_order: items.length,
        is_published: true,
      });
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      onChange(url);
      setOpen(false);
      toast.success("Image ajoutée et sélectionnée");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur upload");
    } finally {
      setUploading(false);
    }
  }

  function select(url: string) {
    onChange(url);
    setOpen(false);
    toast.success("Image sélectionnée");
  }

  return (
    <div className="space-y-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-start gap-3">
        {value ? (
          <div className="relative overflow-hidden rounded-lg border border-border">
            <img src={value} alt="" className="size-24 object-cover" />
          </div>
        ) : (
          <div className="flex size-24 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30">
            <ImageIcon className="size-8 text-muted-foreground/50" />
          </div>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm">{triggerLabel}</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Médiathèque — choisir une image</DialogTitle>
            </DialogHeader>
            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-[180px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…"
                  className="w-full rounded-md border px-3 py-2 pl-9 text-sm" />
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
                <option value="all">Toutes</option>
                {GALLERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <Button type="button" variant="hero" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
                <Upload className="mr-1 size-4" />{uploading ? "Upload…" : "Uploader"}
              </Button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && void quickUpload(e.target.files[0])} />
            </div>
            <div className="mt-4 grid max-h-[50vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
              {filtered.length === 0 ? (
                <p className="col-span-full py-8 text-center text-sm text-muted-foreground">Aucune image — uploadez ou ajoutez dans Médiathèque.</p>
              ) : filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => select(item.url)}
                  className={`group relative overflow-hidden rounded-lg border-2 transition hover:border-gold-deep ${value === item.url ? "border-gold-deep ring-2 ring-gold-deep/30" : "border-transparent"}`}
                >
                  <img src={item.url} alt={item.title} className="aspect-square w-full object-cover" loading="lazy" />
                  {value === item.url && (
                    <span className="absolute right-1 top-1 rounded-full bg-gold-deep p-1 text-white">
                      <Check className="size-3" />
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>Retirer</Button>
        )}
      </div>
    </div>
  );
}
