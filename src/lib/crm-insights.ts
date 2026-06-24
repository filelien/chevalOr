/** Score VIP et insights CRM client hôtelier. */

export type ClientInsights = {
  vipScore: number;
  vipTier: "Standard" | "Silver" | "Gold" | "Platinum";
  totalStays: number;
  totalSpent: number;
  avgStayValue: number;
  lastStay: string | null;
  preferredRoomType: string | null;
  loyaltyPoints: number;
  recommendations: string[];
};

export function computeClientInsights(input: {
  stays: Array<{ status: string; total_price: number; check_in: string; room_type?: string }>;
  reviewCount?: number;
  preferences?: string | null;
}): ClientInsights {
  const active = input.stays.filter((s) => s.status !== "cancelled");
  const totalSpent = active.reduce((sum, s) => sum + Number(s.total_price), 0);
  const totalStays = active.length;
  const avgStayValue = totalStays > 0 ? Math.round(totalSpent / totalStays) : 0;
  const lastStay = active.length > 0
    ? active.reduce((a, b) => (a.check_in > b.check_in ? a : b)).check_in
    : null;

  const typeCounts = new Map<string, number>();
  for (const s of active) {
    if (s.room_type) typeCounts.set(s.room_type, (typeCounts.get(s.room_type) ?? 0) + 1);
  }
  const preferredRoomType = [...typeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  let vipScore = 0;
  vipScore += Math.min(totalStays * 8, 40);
  vipScore += Math.min(Math.floor(totalSpent / 100_000), 35);
  if (input.reviewCount) vipScore += Math.min(input.reviewCount * 5, 15);
  if (lastStay) {
    const monthsSince = (Date.now() - new Date(lastStay).getTime()) / (30 * 86400000);
    if (monthsSince < 6) vipScore += 10;
  }
  vipScore = Math.min(100, vipScore);

  const vipTier: ClientInsights["vipTier"] =
    vipScore >= 80 ? "Platinum" :
    vipScore >= 60 ? "Gold" :
    vipScore >= 35 ? "Silver" : "Standard";

  const recommendations: string[] = [];
  if (preferredRoomType) recommendations.push(`Chambre ${preferredRoomType} — historique favorable`);
  if (vipScore >= 60) recommendations.push("Offrir upgrade ou late check-out");
  if (totalStays >= 3) recommendations.push(`Code fidélité CHEVAL${Math.min(20, 5 + totalStays)}`);
  if (input.preferences?.toLowerCase().includes("petit")) recommendations.push("Petit-déjeuner en chambre");
  if (recommendations.length === 0) recommendations.push("Premier séjour — accueil personnalisé recommandé");

  return {
    vipScore,
    vipTier,
    totalStays,
    totalSpent,
    avgStayValue,
    lastStay,
    preferredRoomType,
    loyaltyPoints: Math.floor(totalSpent / 1000),
    recommendations,
  };
}

export const VIP_TIER_STYLES: Record<ClientInsights["vipTier"], string> = {
  Standard: "bg-secondary text-foreground",
  Silver: "bg-slate-200 text-slate-800",
  Gold: "bg-gold-soft/60 text-gold-deep ring-1 ring-gold/30",
  Platinum: "bg-gradient-to-r from-onyx to-slate-700 text-gold-soft",
};
