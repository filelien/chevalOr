export function generateGuestOtp(length = 6): string {
  const digits = Array.from({ length }, () => Math.floor(Math.random() * 10).toString()).join("");
  return digits;
}

export function isGuestVerificationExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() <= Date.now();
}
