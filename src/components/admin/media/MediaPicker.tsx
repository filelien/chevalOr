import { useMemo, useRef, useState, useEffect } from "react";
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
  triggerElement?: React.ReactNode;
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
};

/** Sélecteur d'image depuis la médiathèque (CMS, SEO, chambres…). */
export function MediaPicker({ value, onChange, label = "Image", triggerLabel = "Choisir depuis la médiathèque", triggerElement, externalOpen, onExternalOpenChange }: MediaPickerProps) {
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

  useEffect(() => {
    if (typeof externalOpen === "boolean") {
      setOpen(externalOpen);
    }
  }, [externalOpen]);

  useEffect(() => {
    if (typeof onExternalOpenChange === "function") onExternalOpenChange(open);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Sync with external open prop when used as a programmatic modal
  // (keeps backward compatibility when prop is not provided)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  // We read externalOpen from props by closure; to avoid lint complexity,
  // useEffect is defined here and will run normally.
  // @ts-ignore
  if (typeof (MediaPicker as any).externalOpen !== "undefined") {
    /* noop to satisfy linter placeholder */
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-foreground">{label}</span>
        {value && <span className="text-xs text-emerald-600 font-medium">✓ Sélectionnée</span>}
      </div>
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-start">
        {value ? (
          <div className="overflow-hidden rounded-4xl border-3 border-gold-deep shadow-xl bg-card ring-4 ring-gold-soft/40">
            <img src={value} alt="Image sélectionnée" className="h-48 w-48 object-cover" />
          </div>
        ) : (
          <div className="flex h-48 w-48 items-center justify-center rounded-4xl border-3 border-dashed border-border bg-secondary/50">
            <ImageIcon className="size-16 text-muted-foreground/40" />
          </div>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          {/** Allow passing a custom trigger element (for inline edit buttons) */}
          {triggerElement ? (
            <DialogTrigger asChild>
              {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
              <>{triggerElement}</>
            </DialogTrigger>
          ) : (
            <DialogTrigger asChild>
              <Button type="button" variant="hero" size="lg" className="h-auto px-8 py-3 text-base">{triggerLabel}</Button>
            </DialogTrigger>
          )}
          <DialogContent className="max-h-[95vh] w-full max-w-7xl overflow-y-auto p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl font-bold">Médiathèque — Choisir une image</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-3.5 size-5 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher les images…"
                    className="w-full rounded-2xl border-2 border-border bg-background py-3 pl-12 pr-4 text-base font-medium focus:border-gold-deep focus:outline-none"
                  />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-2xl border-2 border-border bg-background px-4 py-3 text-base font-medium focus:border-gold-deep focus:outline-none"
                >
                  <option value="all">Toutes catégories</option>
                  {GALLERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <Button
                  type="button"
                  variant="hero"
                  size="lg"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="mr-2 size-5" />
                  {uploading ? "Envoi…" : "Uploader une image"}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && void quickUpload(e.target.files[0])}
                />
              </div>
            </div>
            <div className="mt-10 grid max-h-[75vh] grid-cols-1 gap-6 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
              {filtered.length === 0 ? (
                <div className="col-span-full rounded-3xl border-2 border-dashed border-border bg-secondary/20 p-12 text-center">
                  <ImageIcon className="mx-auto size-16 text-muted-foreground/30" />
                  <p className="mt-4 text-base font-semibold text-foreground">Aucune image trouvée</p>
                  <p className="mt-2 text-sm text-muted-foreground">Modifiez le filtre ou ajoutez une nouvelle image.</p>
                </div>
              ) : (
                filtered.map((item) => {
                  const isSelected = value === item.url;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => select(item.url)}
                      className={`media-picker-card group relative overflow-hidden rounded-3xl transition-all duration-300 ${
                        isSelected
                          ? "ring-4 ring-gold-deep shadow-2xl scale-105 border-2 border-gold-deep"
                          : "border-2 border-border hover:border-gold-deep/60 hover:shadow-xl hover:scale-102"
                      }`}
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <img
                          src={item.url}
                          alt={item.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div
                          className={`absolute inset-0 transition-all duration-300 ${
                            isSelected
                              ? "bg-gold-soft/40"
                              : "bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100"
                          }`}
                        />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className="text-sm font-semibold text-white drop-shadow-lg truncate">{item.title || "Sans titre"}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-gold-deep text-white shadow-lg border-2 border-white">
                          <Check className="size-6" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </DialogContent>
        </Dialog>
        {value && (
          <Button type="button" variant="outline" size="sm" onClick={() => onChange("")} className="mt-4">
            ✕ Retirer l'image
          </Button>
        )}
      </div>
    </div>
  );
}
