import logo from "@/assets/logo-transparent.png";
import logoMark from "@/assets/logo-mark.png";
import { cn } from "@/lib/utils";

const SIZES = {
  xs: "h-8",
  sm: "h-10",
  md: "h-14",
  lg: "h-20",
  xl: "h-28",
} as const;

const TONES = {
  /** Fond clair — header, auth, rapports */
  light: "drop-shadow-[0_1px_8px_rgba(201,162,39,0.25)]",
  /** Fond sombre — footer, admin */
  dark: "brightness-110 drop-shadow-[0_0_14px_rgba(201,162,39,0.45)]",
  /** Hero sur image — fusion douce avec halo doré */
  hero: "brightness-110 contrast-105 saturate-110 drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] drop-shadow-[0_0_28px_rgba(201,162,39,0.65)]",
  /** Sidebar admin sombre */
  admin: "brightness-110 drop-shadow-[0_0_12px_rgba(201,162,39,0.5)]",
} as const;

type HotelLogoProps = {
  size?: keyof typeof SIZES;
  tone?: keyof typeof TONES;
  /** Icône cheval seul — utile pour favicon-like ou espaces compacts */
  mark?: boolean;
  className?: string;
  alt?: string;
  src?: string;
  adminKey?: string;
  wrap?: boolean;
};

export const HOTEL_LOGO_SRC = logo;
export const HOTEL_LOGO_MARK_SRC = logoMark;

export function HotelLogo({
  size = "md",
  tone = "light",
  mark = false,
  className,
  alt = "Hôtel Le Cheval d'Or",
  src,
  adminKey,
  wrap = false,
}: HotelLogoProps) {
  const img = (
    <img
      src={src ?? (mark ? logoMark : logo)}
      alt={alt}
      data-admin-key={adminKey}
      className={cn(
        "w-auto max-w-none object-contain transition-[filter,opacity] duration-300",
        SIZES[size],
        TONES[tone],
        className,
      )}
      loading="lazy"
      decoding="async"
    />
  );

  if (!wrap) return img;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        tone === "hero" && "rounded-2xl bg-black/25 px-5 py-3 ring-1 ring-white/15 backdrop-blur-md",
        tone === "dark" && "rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10",
        tone === "light" && "rounded-xl bg-[#faf8f4]/60 px-3 py-1.5 ring-1 ring-[#c9a227]/15",
      )}
    >
      {img}
    </span>
  );
}
