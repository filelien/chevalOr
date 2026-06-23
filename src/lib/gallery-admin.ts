import { supabase } from "@/integrations/supabase/client";

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

export async function fetchGalleryItems(admin = true) {
  let q = supabase.from("gallery_items").select("*").order("sort_order");
  if (!admin) q = q.eq("is_published", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as GalleryItem[];
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

export async function deleteGalleryItem(id: string) {
  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  if (error) throw error;
}
