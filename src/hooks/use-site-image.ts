import { useEffect, useState } from "react";
import { getSiteSetting } from "@/lib/site-settings";

export function useSiteImage(key: string, fallback?: string) {
  const [src, setSrc] = useState<string | undefined>(fallback);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const value = await getSiteSetting<string>(key, fallback ?? "");
        if (!mounted) return;
        if (value) setSrc(value);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [key, fallback]);
  return src;
}
