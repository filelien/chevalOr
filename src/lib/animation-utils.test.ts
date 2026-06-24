import { describe, expect, it } from "vitest";
import { easeOutCubic, lerpNumber } from "./animation-utils";

describe("animation-utils", () => {
  it("easeOutCubic borne entre 0 et 1", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
  });

  it("interpole correctement les nombres", () => {
    expect(lerpNumber(0, 100, 0)).toBe(0);
    expect(lerpNumber(0, 100, 1)).toBe(100);
    expect(lerpNumber(10, 20, 0.5)).toBeGreaterThan(10);
    expect(lerpNumber(10, 20, 0.5)).toBeLessThan(20);
  });
});
