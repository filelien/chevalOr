import { describe, expect, it } from "vitest";
import { moduleRows, permissionAtCell } from "./permission-matrix";

describe("permission-matrix", () => {
  it("résout reservation.view sur la colonne voir", () => {
    expect(permissionAtCell("reservation", "view")).toBe("reservation.view");
  });

  it("retourne null pour une cellule sans permission", () => {
    expect(permissionAtCell("dashboard", "delete")).toBeNull();
  });

  it("expose au moins les modules métier principaux", () => {
    const ids = moduleRows().map((r) => r.id);
    expect(ids).toContain("reservation");
    expect(ids).toContain("finance");
    expect(ids).toContain("audit");
  });
});
