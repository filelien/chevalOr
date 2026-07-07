import faviconIco from "@/assets/favicon/favicon.ico?url";
import favicon16 from "@/assets/favicon/favicon-16.png?url";
import favicon32 from "@/assets/favicon/favicon-32.png?url";
import favicon48 from "@/assets/favicon/favicon-48.png?url";
import appleTouchIcon from "@/assets/favicon/apple-touch-icon.png?url";

export const FAVICON_LINKS = [
  { rel: "icon", href: faviconIco, sizes: "any" },
  { rel: "shortcut icon", href: faviconIco },
  { rel: "icon", type: "image/png", sizes: "16x16", href: favicon16 },
  { rel: "icon", type: "image/png", sizes: "32x32", href: favicon32 },
  { rel: "icon", type: "image/png", sizes: "48x48", href: favicon48 },
  { rel: "apple-touch-icon", sizes: "180x180", href: appleTouchIcon },
] as const;

export { faviconIco, favicon16, favicon32, favicon48, appleTouchIcon };
