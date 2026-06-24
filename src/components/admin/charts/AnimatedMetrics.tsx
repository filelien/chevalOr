import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { easeOutCubic, prefersReducedMotion } from "@/lib/animation-utils";

/** Compteur animé pour KPIs dashboard. */
export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const displayRef = useRef(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const end = value;
    if (prefersReducedMotion()) {
      displayRef.current = end;
      setDisplay(end);
      return;
    }

    const start = displayRef.current;
    const duration = 800;
    const t0 = performance.now();
    let frame = 0;

    function tick(now: number) {
      const p = Math.min(1, (now - t0) / duration);
      const next = Math.round(start + (end - start) * easeOutCubic(p));
      setDisplay(next);
      if (p < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        displayRef.current = end;
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span className={cn("animated-number tabular-nums", className)}>
      {format ? format(display) : display}
    </span>
  );
}

/** Barre de progression animée. */
export function AnimatedBar({ percent, color = "#C9A227" }: { percent: number; color?: string }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="animated-bar h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}

/** Anneau de progression (occupation). */
export function OccupancyRing({
  percent,
  size = 88,
  variant = "default",
}: {
  percent: number;
  size?: number;
  variant?: "default" | "dark";
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (c * clamped) / 100;
  const trackStroke = variant === "dark" ? "rgba(255,255,255,0.28)" : "#d1d5db";
  const labelClass = variant === "dark" ? "text-gold-soft" : "text-foreground";

  return (
    <div className="relative inline-flex shrink-0" style={{ width: size, height: size }} aria-label={`Occupation ${Math.round(clamped)} pour cent`}>
      <svg width={size} height={size} className="occupancy-ring -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackStroke} strokeWidth={6} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#C9A227"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="occupancy-ring-progress transition-all duration-1000 ease-out"
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center ${labelClass}`}>
        <span className="font-display text-base font-semibold tabular-nums leading-none md:text-lg">
          {Math.round(clamped)}%
        </span>
      </div>
    </div>
  );
}
