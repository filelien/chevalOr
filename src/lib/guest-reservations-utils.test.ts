import { describe, expect, it } from "vitest";
import { generateGuestOtp, isGuestVerificationExpired } from "./guest-reservations-utils";

describe("guest reservation verification helpers", () => {
  it("generates a 6-digit OTP", () => {
    const otp = generateGuestOtp();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it("flags expired verification codes", () => {
    const expired = isGuestVerificationExpired(new Date(Date.now() - 5 * 60 * 1000).toISOString());
    expect(expired).toBe(true);
  });

  it("keeps fresh verification codes valid", () => {
    const fresh = isGuestVerificationExpired(new Date(Date.now() + 10 * 60 * 1000).toISOString());
    expect(fresh).toBe(false);
  });
});
