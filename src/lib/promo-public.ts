import { supabase } from "@/integrations/supabase/client";

export type PublicPromo = {
  code: string;
  title: string;
  discount_percent: number;
  valid_until: string | null;
};

export async function fetchActivePromos(): Promise<PublicPromo[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("promo_codes")
    .select("code, title, discount_percent, valid_until")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).filter((p) => !p.valid_until || p.valid_until >= today) as PublicPromo[];
}
