import { supabase } from "@/integrations/supabase/client";

export type PromoCode = {
  code: string;
  title: string;
  discount_percent: number;
  valid_until: string | null;
};

export async function validatePromoCode(code: string): Promise<PromoCode | null> {
  if (!code.trim()) return null;
  const { data, error } = await supabase
    .from("promo_codes")
    .select("code, title, discount_percent, valid_until")
    .eq("code", code.trim().toUpperCase())
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (data.valid_until && data.valid_until < new Date().toISOISOString().slice(0, 10)) return null;
  return data as PromoCode;
}

export function applyDiscount(subtotal: number, discountPercent: number) {
  const discount = Math.round(subtotal * discountPercent / 100);
  return { total: subtotal - discount, discount, discountPercent };
}
