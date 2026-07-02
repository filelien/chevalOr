import { supabase } from "@/integrations/supabase/client";

export type ReviewStatus = "pending" | "published" | "hidden" | "archived";

export type Review = {
  id: string;
  reservation_id: string | null;
  profile_id: string | null;
  author_name: string;
  author_email: string | null;
  rating: number; // 1-5
  cleanliness_rating?: number;
  service_rating?: number;
  comfort_rating?: number;
  value_rating?: number;
  comment: string;
  title?: string;
  is_published?: boolean;
  admin_reply: string | null;
  admin_reply_by?: string;
  admin_reply_date?: string;
  status?: ReviewStatus;
  is_verified?: boolean;
  created_at: string;
};

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: "En attente",
  published: "Publié",
  hidden: "Masqué",
  archived: "Archivé",
};

export const REVIEW_STATUS_BADGE: Record<ReviewStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  hidden: "bg-slate-100 text-slate-800",
  archived: "bg-gray-100 text-gray-800",
};

/** Récupère les avis avec filtres. */
export async function fetchReviews(filters?: {
  admin?: boolean;
  status?: ReviewStatus;
  search?: string;
  ratingMin?: number;
}) {
  let q = supabase.from("reviews").select("*").order("created_at", { ascending: false });

  if (!filters?.admin) q = q.eq("is_published", true);
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.ratingMin) q = q.gte("rating", filters.ratingMin);

  const { data, error } = await q;
  if (error) throw error;

  let reviews = (data ?? []) as Review[];
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    reviews = reviews.filter(
      (r) =>
        r.author_name.toLowerCase().includes(s) ||
        r.comment.toLowerCase().includes(s) ||
        (r.title?.toLowerCase().includes(s) ?? false)
    );
  }

  return reviews;
}

/** Crée ou met à jour un avis. */
export async function upsertReview(id: string | null, review: Omit<Review, "id" | "created_at">) {
  const payload = {
    ...review,
    admin_reply_by: review.admin_reply_by ?? null,
    admin_reply_date: review.admin_reply_date ?? null,
  };

  if (id) {
    const { error } = await supabase.from("reviews").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("reviews").insert(payload);
    if (error) throw error;
  }
}

/** Publie un avis. */
export async function publishReview(id: string) {
  const { error } = await supabase.from("reviews").update({ is_published: true, status: "published" }).eq("id", id);
  if (error) throw error;
}

/** Masque un avis. */
export async function hideReview(id: string) {
  const { error } = await supabase.from("reviews").update({ is_published: false, status: "hidden" }).eq("id", id);
  if (error) throw error;
}

/** Archive un avis. */
export async function archiveReview(id: string) {
  const { error } = await supabase.from("reviews").update({ status: "archived" }).eq("id", id);
  if (error) throw error;
}

/** Supprime complètement un avis. */
export async function deleteReview(id: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}

/** Met à jour des champs spécifiques d'un avis. */
export async function updateReview(id: string, updates: Partial<Review>) {
  const { error } = await supabase.from("reviews").update(updates).eq("id", id);
  if (error) throw error;
}

/** Ajoute/met à jour une réponse à un avis. */
export async function respondToReview(id: string, reply: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("reviews")
    .update({
      admin_reply: reply,
      admin_reply_by: user?.id ?? null,
      admin_reply_date: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

/** Récupère les statistiques d'avis. */
export async function fetchReviewStats() {
  const { data, error } = await supabase.from("reviews").select("rating, is_published, status");
  if (error) throw error;

  const reviews = (data ?? []) as Array<{ rating: number; is_published?: boolean; status?: ReviewStatus }>;
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const publishedCount = reviews.filter((r) => r.is_published ?? r.status === "published").length;
  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const totalCount = reviews.length;

  return {
    avgRating: avgRating.toFixed(1),
    totalCount,
    publishedCount,
    pendingCount,
    distributionByRating: [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: reviews.filter((r) => r.rating === rating).length,
    })),
  };
}

