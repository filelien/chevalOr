import { supabase } from "@/integrations/supabase/client";
import type { PromoCode } from "@/lib/promo";

export type PromoRow = PromoCode & { id: string; is_active: boolean };

export async function fetchPromoCodes(): Promise<PromoRow[]> {
  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PromoRow[];
}

export async function upsertPromoCode(input: {
  id?: string;
  code: string;
  title: string;
  discount_percent: number;
  valid_until: string | null;
  is_active: boolean;
}) {
  const row = {
    code: input.code.trim().toUpperCase(),
    title: input.title,
    discount_percent: input.discount_percent,
    valid_until: input.valid_until || null,
    is_active: input.is_active,
  };
  if (input.id) {
    const { error } = await supabase.from("promo_codes").update(row).eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("promo_codes").insert(row);
    if (error) throw error;
  }
}

export async function deletePromoCode(id: string) {
  const { error } = await supabase.from("promo_codes").delete().eq("id", id);
  if (error) throw error;
}
