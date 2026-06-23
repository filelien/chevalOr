import { supabase } from "@/integrations/supabase/client";

export type Review = {
  id: string;
  author_name: string;
  author_email: string | null;
  rating: number;
  comment: string;
  is_published: boolean;
  admin_reply: string | null;
  created_at: string;
};

export async function fetchReviews(admin = true) {
  let q = supabase.from("reviews").select("*").order("created_at", { ascending: false });
  if (!admin) q = q.eq("is_published", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Review[];
}

export async function updateReview(
  id: string,
  patch: Partial<Pick<Review, "is_published" | "admin_reply">>,
) {
  const { error } = await supabase.from("reviews").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}
