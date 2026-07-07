import { supabase } from "@/integrations/supabase/client";
import { deleteGalleryStorageFile } from "@/lib/media-upload";

export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  url: string;
  media_type: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
  alt_text?: string | null;
  description?: string | null;
  tags?: string[];
  author?: string | null;
  usage_count?: number;
  width?: number | null;
  height?: number | null;
  file_size?: number | null;
  metadata?: Record<string, unknown> | null;
  is_favorite?: boolean;
  versions?: Record<string, unknown>[] | null;
};

export type GalleryFilterOptions = {
  search?: string;
  category?: string;
  published?: "all" | "published" | "draft";
  mediaType?: "all" | "image" | "video" | "file";
  favorite?: boolean;
  tags?: string;
};

export type MediaSortBy = "recent" | "title" | "category" | "order" | "favorite" | "usage" | "size";

export const GALLERY_CATEGORIES = [
  "Hôtel",
  "Chambres",
  "Restaurant",
  "Événements",
  "Conférence",
  "Extérieur",
  "Équipe",
  "Autre",
] as const;

export async function fetchGalleryItems(admin = true) {
  let q = supabase.from("gallery_items").select("*").order("sort_order").order("created_at", { ascending: false });
  if (!admin) q = q.eq("is_published", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as GalleryItem[];
}

export function getMediaFileName(item: GalleryItem) {
  const match = item.url.match(/[^/\\]+$/);
  return match?.[0] ?? item.title;
}

export function getMediaExtension(item: GalleryItem) {
  const fileName = getMediaFileName(item);
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex + 1).toUpperCase() : item.media_type.toUpperCase();
}

export function getMediaDimensions(item: GalleryItem) {
  if (item.width && item.height) return `${item.width}×${item.height}`;
  if (item.metadata?.width && item.metadata?.height) {
    return `${item.metadata.width}×${item.metadata.height}`;
  }
  return "—";
}

export function getMediaSize(item: GalleryItem) {
  const size = item.file_size ?? Number(item.metadata?.size ?? 0);
  if (!size) return "—";
  if (size >= 1_000_000) return `${(size / 1_000_000).toFixed(1)} Mo`;
  if (size >= 1_000) return `${(size / 1_000).toFixed(1)} Ko`;
  return `${size} o`;
}

export function normalizeTags(tags?: string[] | string) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((tag) => tag.trim()).filter(Boolean);
  return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
}

export function filterGalleryItems(items: GalleryItem[], opts: GalleryFilterOptions): GalleryItem[] {
  let rows = items;
  if (opts.category && opts.category !== "all") {
    rows = rows.filter((r) => r.category === opts.category);
  }
  if (opts.published === "published") rows = rows.filter((r) => r.is_published);
  if (opts.published === "draft") rows = rows.filter((r) => !r.is_published);
  if (opts.mediaType && opts.mediaType !== "all") {
    rows = rows.filter((r) => {
      if (opts.mediaType === "image") return r.media_type.includes("image");
      if (opts.mediaType === "video") return r.media_type.includes("video");
      return !r.media_type.includes("image") && !r.media_type.includes("video");
    });
  }
  if (opts.favorite) rows = rows.filter((r) => r.is_favorite);
  if (opts.tags?.trim()) {
    const term = opts.tags.toLowerCase();
    rows = rows.filter((r) => (r.tags ?? []).some((tag) => tag.toLowerCase().includes(term)));
  }
  if (opts.search?.trim()) {
    const s = opts.search.toLowerCase();
    rows = rows.filter((r) => {
      const haystack = `${r.title} ${r.category} ${r.url} ${getMediaFileName(r)} ${r.media_type} ${r.alt_text ?? ""} ${r.description ?? ""} ${r.author ?? ""} ${(r.tags ?? []).join(" ")}`.toLowerCase();
      return haystack.includes(s);
    });
  }
  return rows;
}

export function sortGalleryItems(items: GalleryItem[], sortBy: MediaSortBy = "recent") {
  const rows = [...items];
  rows.sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "category":
        return a.category.localeCompare(b.category);
      case "order":
        return a.sort_order - b.sort_order;
      case "favorite":
        return Number(b.is_favorite ?? false) - Number(a.is_favorite ?? false) || a.title.localeCompare(b.title);
      case "usage":
        return (b.usage_count ?? 0) - (a.usage_count ?? 0) || a.title.localeCompare(b.title);
      case "size":
        return (b.file_size ?? 0) - (a.file_size ?? 0) || a.title.localeCompare(b.title);
      case "recent":
      default: {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA || a.sort_order - b.sort_order;
      }
    }
  });
  return rows;
}

export async function saveGalleryItem(input: Omit<GalleryItem, "id" | "created_at"> & { id?: string }) {
  const row = {
    title: input.title,
    category: input.category,
    url: input.url,
    media_type: input.media_type,
    sort_order: input.sort_order,
    is_published: input.is_published,
    alt_text: input.alt_text ?? null,
    description: input.description ?? null,
    tags: normalizeTags(input.tags),
    author: input.author ?? null,
    is_favorite: input.is_favorite ?? false,
    usage_count: input.usage_count ?? 0,
    width: input.width ?? null,
    height: input.height ?? null,
    file_size: input.file_size ?? null,
    metadata: input.metadata ?? null,
    versions: input.versions ?? null,
  };
  if (input.id) {
    const { error } = await supabase.from("gallery_items").update(row).eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("gallery_items").insert(row);
    if (error) throw error;
  }
}

export async function deleteGalleryItem(id: string, url?: string) {
  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  if (error) throw error;
  if (url) await deleteGalleryStorageFile(url);
}

