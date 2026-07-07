/** Interpolation ease-out cubique (0–1). */
export function easeOutCubic(t: number): number {
  const p = Math.min(1, Math.max(0, t));
  return 1 - (1 - p) ** 3;
}

/** Valeur interpolée entre start et end. */
export function lerpNumber(start: number, end: number, progress: number): number {
  return Math.round(start + (end - start) * easeOutCubic(progress));
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
