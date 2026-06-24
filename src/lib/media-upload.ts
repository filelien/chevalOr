import { supabase } from "@/integrations/supabase/client";

const GALLERY_BUCKET = "gallery";

export function storagePathFromPublicUrl(url: string, bucket = GALLERY_BUCKET): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

export async function uploadGalleryFile(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(GALLERY_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadGalleryFiles(files: File[]) {
  const urls: string[] = [];
  for (const file of files) {
    urls.push(await uploadGalleryFile(file));
  }
  return urls;
}

export async function deleteGalleryStorageFile(publicUrl: string) {
  const path = storagePathFromPublicUrl(publicUrl);
  if (!path) return;
  const { error } = await supabase.storage.from(GALLERY_BUCKET).remove([path]);
  if (error) console.warn("[media] delete storage:", error.message);
}

