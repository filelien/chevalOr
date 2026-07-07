import { supabase } from "@/integrations/supabase/client";

export async function getSiteSetting<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
  if (error) throw error;
  if (!data?.value) return fallback;
  return data.value as T;
}

export async function setSiteSetting(key: string, value: unknown) {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
}

export async function fetchAllSiteSettings() {
  const { data, error } = await supabase.from("site_settings").select("key, value, updated_at");
  if (error) throw error;
  return data ?? [];
}
