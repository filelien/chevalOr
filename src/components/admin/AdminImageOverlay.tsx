import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { setSiteSetting } from "@/lib/site-settings";
import { useAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export function AdminImageOverlay() {
  const [targets, setTargets] = useState<HTMLImageElement[]>([]);
  const [positions, setPositions] = useState<Record<string, DOMRect>>({});
  const [activeImg, setActiveImg] = useState<HTMLImageElement | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [lastChange, setLastChange] = useState<{ key?: string | null; previous: string; current: string } | null>(null);

  useEffect(() => {
    // Find images inside the main admin area only
    function scan() {
      const imgs = Array.from(document.querySelectorAll('main img')) as HTMLImageElement[];
      const filtered = imgs.filter((i) => !i.dataset.adminNoEdit);
      setTargets(filtered);
    }
    scan();
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });
    const onResize = () => updatePositions();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      mo.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function updatePositions() {
      const next: Record<string, DOMRect> = {};
      targets.forEach((img, idx) => {
        const r = img.getBoundingClientRect();
        next[`img-${idx}`] = r;
      });
      setPositions(next);
    }
    updatePositions();
    const t = setInterval(updatePositions, 600);
    return () => clearInterval(t);
  }, [targets]);

  const overlays = useMemo(() => Object.entries(positions).map(([key, rect], idx) => ({ key, rect, idx })), [positions]);

  function handleOpenForIndex(idx: number) {
    const img = targets[idx];
    if (!img) return;
    setActiveImg(img);
    setPickerOpen(true);
  }

  function handleChange(url: string) {
    if (!activeImg) return;
    const prev = activeImg.src;
    activeImg.src = url;
    activeImg.setAttribute("data-edit-src", url);
    setPickerOpen(false);
    // quick toast
    try { (window as any).toast?.success?.("Image mise à jour"); } catch {}
    // persist if key present
    handlePersist(url);
    // audit
    logAudit({ action: "site_image_updated", module: "site", entity_type: "image", entity_id: activeImg.dataset.adminKey ?? null, details: { previous: prev, new: url } }).catch(() => {});
    setLastChange({ key: activeImg.dataset.adminKey ?? null, previous: prev, current: url });
    // auto-clear undo after 12s
    setTimeout(() => setLastChange((s) => (s && s.current === url ? null : s)), 12_000);
  }

  async function handlePersist(url: string) {
    // If the image carries a data-admin-key attribute, persist the value
    const key = activeImg?.dataset?.adminKey;
    if (key) {
      try {
        await setSiteSetting(key, url);
        try { (window as any).toast?.success?.("Image enregistrée"); } catch {}
      } catch (e) {
        try { (window as any).toast?.error?.("Erreur enregistrement"); } catch {}
      }
    }
  }

  const { isStaff } = useAuth();
  if (!isStaff) return null;

  return createPortal(
    <>
      {lastChange && (
        <div className="fixed right-6 bottom-6 z-[10001] flex items-center gap-3 rounded-lg bg-card p-3 shadow-lg">
          <div className="text-sm">Image mise à jour</div>
          <Button size="sm" variant="ghost" onClick={async () => {
            if (!lastChange) return;
            // revert in DOM
            const key = lastChange.key;
            const prev = lastChange.previous;
            // find image with data-admin-key or any with data-edit-src matching current
            const imgs = Array.from(document.querySelectorAll('main img')) as HTMLImageElement[];
            const target = imgs.find((i) => (key ? i.dataset.adminKey === key : i.dataset.editSrc === lastChange.current));
            if (target) target.src = prev;
            try { if (key) await setSiteSetting(key, prev); } catch {}
            try { await logAudit({ action: "site_image_reverted", module: "site", entity_type: "image", entity_id: key ?? null, details: { restored: prev } }); } catch {}
            setLastChange(null);
            try { (window as any).toast?.success?.("Restauration effectuée"); } catch {}
          }}>Annuler</Button>
        </div>
      )}
      {overlays.map((o) => {
        const { rect, idx } = o;
        const style: React.CSSProperties = {
          position: "fixed",
          left: rect.left + window.scrollX + rect.width - 42,
          top: rect.top + window.scrollY + 6,
          zIndex: 9999,
        };
        return (
          <div key={o.key} style={style}>
            <Button size="sm" variant="ghost" onClick={() => handleOpenForIndex(idx)}>
              <Edit3 className="size-4" />
            </Button>
          </div>
        );
      })}

      {pickerOpen && (
        <MediaPicker
          value={activeImg?.src ?? ""}
          onChange={handleChange}
          label="Modifier l'image"
          triggerLabel="Choisir"
          externalOpen={pickerOpen}
          onExternalOpenChange={(o) => setPickerOpen(o)}
        />
      )}
    </>,
    document.body,
  );
}
