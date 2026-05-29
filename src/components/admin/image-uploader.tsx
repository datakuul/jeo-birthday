"use client";

import { useState } from "react";
import { Loader2, ImagePlus } from "lucide-react";
import { uploadImage } from "@/app/admin/(panel)/gallery/actions";
import { Input } from "@/components/ui/field";

const MAX_DIM = 1600; // longest edge for the stored optimized image

/** Resize + re-encode (strips EXIF) on the client; returns blob + dimensions. */
async function processImage(file: File): Promise<{
  blob: Blob;
  width: number;
  height: number;
  blurData: string;
}> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);

  // Tiny blur placeholder (16px wide)
  const bw = 16;
  const bh = Math.max(1, Math.round((h / w) * bw));
  const bc = document.createElement("canvas");
  bc.width = bw;
  bc.height = bh;
  bc.getContext("2d")!.drawImage(bitmap, 0, 0, bw, bh);
  const blurData = bc.toDataURL("image/jpeg", 0.5);

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/webp", 0.82),
  );
  return { blob, width: w, height: h, blurData };
}

export function ImageUploader({ albumId }: { albumId: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    setMsg(null);
    let okCount = 0;
    for (const file of files) {
      try {
        const { blob, width, height, blurData } = await processImage(file);
        const fd = new FormData();
        fd.set("albumId", albumId);
        fd.set("file", new File([blob], "photo.webp", { type: "image/webp" }));
        fd.set("alt", alt || caption || "Celebration photograph");
        fd.set("caption", caption);
        fd.set("width", String(width));
        fd.set("height", String(height));
        fd.set("blurData", blurData);
        const res = await uploadImage(fd);
        if (res.ok) okCount++;
        else {
          setMsg({ ok: false, text: res.error ?? "Upload failed." });
          break;
        }
      } catch {
        setMsg({ ok: false, text: "Could not process that image." });
        break;
      }
    }
    if (okCount) setMsg({ ok: true, text: `Uploaded ${okCount} image(s).` });
    setBusy(false);
    e.target.value = "";
  }

  return (
    <div className="rounded-lg border border-dashed border-border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input placeholder="Alt text (description)" value={alt} onChange={(e) => setAlt(e.target.value)} />
        <Input placeholder="Caption (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} />
      </div>
      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-gold-strong px-5 py-2 text-sm font-medium text-white">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
        {busy ? "Processing…" : "Choose photos"}
        <input type="file" accept="image/*" multiple hidden onChange={onPick} disabled={busy} />
      </label>
      <p className="mt-2 text-xs text-muted-foreground">
        Images are resized and stripped of metadata in your browser before upload — no raw phone photos are sent.
      </p>
      {msg && (
        <p className={"mt-2 text-sm " + (msg.ok ? "text-[oklch(0.5_0.12_150)]" : "text-destructive")}>{msg.text}</p>
      )}
    </div>
  );
}
