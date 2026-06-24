import { describe, expect, it } from "vitest";
import { auditActionBadge } from "./audit";

describe("auditActionBadge", () => {
  it("marque les créations en vert", () => {
    const badge = auditActionBadge("reservation_created");
    expect(badge.label).toBe("CRÉATION");
    expect(badge.className).toContain("audit-badge--success");
  });

  it("marque les suppressions en rouge", () => {
    const badge = auditActionBadge("user_deleted");
    expect(badge.label).toBe("SUPPRESSION");
    expect(badge.className).toContain("audit-badge--danger");
  });

  it("marque les modifications en bleu", () => {
    const badge = auditActionBadge("permissions_updated");
    expect(badge.label).toBe("MODIFICATION");
    expect(badge.className).toContain("audit-badge--info");
  });

  it("marque les annulations en ambre", () => {
    const badge = auditActionBadge("reservation_cancel");
    expect(badge.label).toBe("ANNULATION");
    expect(badge.className).toContain("audit-badge--warning");
  });
});
