import { describe, expect, it } from "vitest";
import { computeClientInsights } from "./crm-insights";

describe("computeClientInsights", () => {
  it("ignore les séjours annulés", () => {
    const result = computeClientInsights({
      stays: [
        { status: "completed", total_price: 100_000, check_in: "2026-03-01", room_type: "Standard" },
        { status: "cancelled", total_price: 50_000, check_in: "2026-02-01" },
      ],
    });
    expect(result.totalStays).toBe(1);
    expect(result.totalSpent).toBe(100_000);
  });

  it("attribue un palier VIP selon le score", () => {
    const result = computeClientInsights({
      stays: Array.from({ length: 6 }, (_, i) => ({
        status: "completed",
        total_price: 200_000,
        check_in: `2026-0${(i % 5) + 1}-15`,
        room_type: "Suite",
      })),
      reviewCount: 3,
    });
    expect(result.vipScore).toBeGreaterThanOrEqual(60);
    expect(["Gold", "Platinum"]).toContain(result.vipTier);
  });

  it("propose des recommandations personnalisées", () => {
    const result = computeClientInsights({
      stays: [{ status: "completed", total_price: 80_000, check_in: "2026-01-10", room_type: "Deluxe" }],
    });
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.preferredRoomType).toBe("Deluxe");
  });
});
