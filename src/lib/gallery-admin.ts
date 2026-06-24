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
};

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

export function filterGalleryItems(
  items: GalleryItem[],
  opts: { search?: string; category?: string; published?: "all" | "published" | "draft" },
): GalleryItem[] {
  let rows = items;
  if (opts.category && opts.category !== "all") {
    rows = rows.filter((r) => r.category === opts.category);
  }
  if (opts.published === "published") rows = rows.filter((r) => r.is_published);
  if (opts.published === "draft") rows = rows.filter((r) => !r.is_published);
  if (opts.search?.trim()) {
    const s = opts.search.toLowerCase();
    rows = rows.filter((r) => `${r.title} ${r.category} ${r.url}`.toLowerCase().includes(s));
  }
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

