import { describe, expect, it } from "vitest";
import { allChecksPassed, runLogicHealthChecks } from "./system-checks";

describe("system-checks", () => {
  it("exécute toutes les vérifications avec succès", () => {
    const checks = runLogicHealthChecks();
    expect(checks.length).toBeGreaterThanOrEqual(5);
    expect(allChecksPassed(checks)).toBe(true);
  });
});
