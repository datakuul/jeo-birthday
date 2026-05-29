"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, Trash2, Save, Star, Flower2 } from "lucide-react";
import {
  createAlbum,
  updateImageMeta,
  deleteImage,
  type FormResult,
} from "@/app/admin/(panel)/gallery/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { Card } from "@/components/ui/card";

export function CreateAlbumForm() {
  const [state, action, pending] = useActionState<FormResult | null, FormData>(createAlbum, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <Card className="p-5">
      <form ref={ref} action={action} className="flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="title">New album title</Label>
          <Input id="title" name="title" placeholder="e.g. The Wedding, 1974" className="w-64" required />
        </div>
        <div className="flex-1">
          <Label htmlFor="description">Description (optional)</Label>
          <Input id="description" name="description" placeholder="A short line about this album" />
        </div>
        <Button type="submit" variant="gold" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Create album
        </Button>
      </form>
      {state && !state.ok && state.error && <p className="mt-2 text-sm text-destructive">{state.error}</p>}
    </Card>
  );
}

export type AdminImage = {
  id: string;
  url: string | null;
  thumbUrl: string | null;
  alt: string;
  caption: string;
  year: number | null;
  isFeatured: boolean;
  isPlaceholder: boolean;
  sortOrder: number;
};

export function ImageCard({ image }: { image: AdminImage }) {
  const [state, action, pending] = useActionState<FormResult | null, FormData>(updateImageMeta, null);
  const [confirming, setConfirming] = useState(false);
  const src = image.thumbUrl ?? image.url;

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] bg-surface-muted">
        {src ? (
          <Image src={src} alt={image.alt} fill sizes="200px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Flower2 className="size-6 text-gold-strong/50" />
          </div>
        )}
        {image.isFeatured && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold-strong px-2 py-0.5 text-[0.65rem] font-medium text-white">
            <Star className="size-3" /> Featured
          </span>
        )}
        {image.isPlaceholder && (
          <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[0.65rem] text-white">
            Placeholder
          </span>
        )}
      </div>

      <form action={action} className="space-y-2 p-3">
        <input type="hidden" name="id" value={image.id} />
        <Input name="alt" defaultValue={image.alt} placeholder="Alt text *" className="h-9 text-sm" required />
        <Input name="caption" defaultValue={image.caption} placeholder="Caption" className="h-9 text-sm" />
        <div className="flex items-center gap-2">
          <Input name="year" type="number" defaultValue={image.year ?? ""} placeholder="Year" className="h-9 w-24 text-sm" />
          <Input name="sortOrder" type="number" defaultValue={image.sortOrder} className="h-9 w-20 text-sm" title="Sort order" />
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input type="checkbox" name="isFeatured" defaultChecked={image.isFeatured} className="accent-[var(--color-gold-strong)]" />
            Featured
          </label>
        </div>
        <div className="flex items-center justify-between">
          <Button type="submit" size="sm" variant="outline" disabled={pending}>
            {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Save
          </Button>
          {confirming ? (
            <span className="flex items-center gap-1 text-xs">
              <button type="button" onClick={() => deleteImage(image.id)} className="text-destructive underline">
                Confirm
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="text-muted-foreground underline">
                Cancel
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="text-muted-foreground hover:text-destructive" aria-label="Delete">
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
        {state?.ok && state.message && <p className="text-xs text-[oklch(0.5_0.12_150)]">{state.message}</p>}
      </form>
    </Card>
  );
}
