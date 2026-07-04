import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import { MediaPicker } from "./MediaPicker";

type Props = {
  src?: string;
  alt?: string;
  className?: string;
  onChange?: (url: string) => void;
  placeholder?: React.ReactNode;
};

export function EditableImage({ src, alt, className = "", onChange, placeholder }: Props) {
  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img src={src} alt={alt ?? "image"} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">{placeholder ?? <span className="text-sm text-muted-foreground">Pas d'image</span>}</div>
      )}

      <div className="absolute right-2 top-2">
        <MediaPicker
          value={src}
          onChange={(url) => onChange?.(url)}
          label="Modifier l'image"
          triggerElement={<Button size="sm" variant="ghost"><Edit3 className="size-4" /></Button>}
          triggerLabel="Choisir"
        />
      </div>
    </div>
  );
}
