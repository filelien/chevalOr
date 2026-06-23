import { supabase } from "@/integrations/supabase/client";

export async function uploadGalleryFile(file: File) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("gallery").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("gallery").getPublicUrl(path);
  return data.publicUrl;
}
