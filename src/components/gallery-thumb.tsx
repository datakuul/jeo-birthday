import Image from "next/image";
import { Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ThumbImage = {
  id: string;
  url: string | null;
  thumbUrl: string | null;
  blurData: string | null;
  width: number | null;
  height: number | null;
  alt: string;
  caption: string;
  year: number | null;
  isPlaceholder: boolean;
};

/**
 * A single gallery thumbnail. Renders an optimized next/image when a real URL
 * exists; otherwise an elegant gold-monogram placeholder (the family will add
 * photos later via the admin gallery). Below-the-fold images lazy-load.
 */
export function GalleryThumb({
  image,
  priority = false,
  className,
}: {
  image: ThumbImage;
  priority?: boolean;
  className?: string;
}) {
  const src = image.thumbUrl ?? image.url;

  return (
    <figure
      className={cn(
        "group relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-surface-muted",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
          loading={priority ? "eager" : "lazy"}
          priority={priority}
          placeholder={image.blurData ? "blur" : "empty"}
          blurDataURL={image.blurData ?? undefined}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <Placeholder caption={image.caption} year={image.year} />
      )}
      {image.caption && src && (
        <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent p-3 text-xs text-white transition-transform duration-300 group-hover:translate-y-0">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

function Placeholder({ caption, year }: { caption?: string; year?: number | null }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_30%,var(--color-gold-soft),var(--color-surface-muted))] p-4 text-center">
      <Flower2 className="size-7 text-gold-strong/70" aria-hidden />
      <p className="mt-3 font-serif text-sm text-foreground/70">
        {caption || "A memory to come"}
      </p>
      {year ? (
        <p className="mt-1 text-[0.65rem] uppercase tracking-widest text-muted-foreground">
          {year}
        </p>
      ) : null}
      <span className="mt-3 text-[0.6rem] uppercase tracking-[0.2em] text-gold-strong/60">
        Photo coming soon
      </span>
    </div>
  );
}
