"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { GalleryThumb, type ThumbImage } from "@/components/gallery-thumb";
import { useLiteMode } from "@/components/lite-mode";
import { Button } from "@/components/ui/button";

const BATCH = 12;

export function GalleryGrid({ images }: { images: ThumbImage[] }) {
  const { lite } = useLiteMode();
  const [visible, setVisible] = useState(BATCH);
  const [open, setOpen] = useState<number | null>(null);

  const shown = images.slice(0, visible);

  // Keyboard navigation for the lightbox.
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((o) => (o === null ? o : Math.min(images.length - 1, o + 1)));
      if (e.key === "ArrowLeft") setOpen((o) => (o === null ? o : Math.max(0, o - 1)));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, images.length]);

  const active = open !== null ? images[open] : null;
  const fullSrc = active?.url ?? active?.thumbUrl ?? null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {shown.map((img, i) => {
          // In Lite Mode placeholders stay as-is; real images open on tap only.
          const clickable = !img.isPlaceholder && (img.url || img.thumbUrl);
          return clickable ? (
            <button
              key={img.id}
              type="button"
              onClick={() => setOpen(i)}
              className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
              aria-label={`Open ${img.alt}`}
            >
              <GalleryThumb image={img} priority={i < 4 && !lite} />
            </button>
          ) : (
            <GalleryThumb key={img.id} image={img} />
          );
        })}
      </div>

      {visible < images.length && (
        <div className="mt-10 text-center">
          <Button
            variant="outline"
            onClick={() => setVisible((v) => v + BATCH)}
          >
            Load more ({images.length - visible} remaining)
          </Button>
        </div>
      )}

      {/* Lightbox — full image fetched only on demand */}
      {active && fullSrc && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          onClick={() => setOpen(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close"
            onClick={() => setOpen(null)}
          >
            <X className="size-6" />
          </button>

          {open !== null && open > 0 && (
            <button
              type="button"
              className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((o) => (o === null ? o : Math.max(0, o - 1)));
              }}
            >
              <ChevronLeft className="size-7" />
            </button>
          )}
          {open !== null && open < images.length - 1 && (
            <button
              type="button"
              className="absolute right-4 bottom-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((o) => (o === null ? o : Math.min(images.length - 1, o + 1)));
              }}
            >
              <ChevronRight className="size-7" />
            </button>
          )}

          <figure
            className="relative max-h-[85vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mx-auto" style={{ maxHeight: "85vh" }}>
              <Image
                src={fullSrc}
                alt={active.alt}
                width={active.width ?? 1200}
                height={active.height ?? 1500}
                sizes="(max-width: 768px) 100vw, 768px"
                className="mx-auto max-h-[85vh] w-auto rounded-lg object-contain"
              />
            </div>
            {active.caption && (
              <figcaption className="mt-3 text-center text-sm text-white/80">
                {active.caption}
                {active.year ? ` · ${active.year}` : ""}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  );
}
