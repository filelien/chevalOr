import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function LightboxGallery({ images }: { images: { src: string; alt: string }[] }) {
  const [idx, setIdx] = useState<number | null>(null);
  if (images.length === 0) return null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
            <img src={img.src} alt={img.alt} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
          </button>
        ))}
      </div>
      {idx !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setIdx(null)}>
          <button className="absolute right-4 top-4 text-white" onClick={() => setIdx(null)} aria-label="Fermer"><X /></button>
          <button className="absolute left-4 text-white" onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + images.length) % images.length); }}><ChevronLeft className="size-8" /></button>
          <img src={images[idx].src} alt={images[idx].alt} className="max-h-[85vh] max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-12 text-white" onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % images.length); }}><ChevronRight className="size-8" /></button>
        </div>
      )}
    </>
  );
}
