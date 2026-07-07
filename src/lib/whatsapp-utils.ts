/**
 * WhatsApp phone number normalization for wa.me links
 */

/** Strip everything except digits from a phone string */
export function normalizeWhatsAppPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Format phone for display (+228 XX XX XX XX) */
export function formatWhatsAppPhone(phone: string): string {
  const digits = normalizeWhatsAppPhone(phone);
  if (!digits) return "";
  if (digits.startsWith("228") && digits.length >= 11) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  }
  return `+${digits}`;
}

/** Build wa.me URL with optional message */
export function buildWhatsAppUrl(phone: string, message?: string): string {
  const normalized = normalizeWhatsAppPhone(phone);
  if (!normalized) return "https://wa.me/";
  const base = `https://wa.me/${normalized}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
