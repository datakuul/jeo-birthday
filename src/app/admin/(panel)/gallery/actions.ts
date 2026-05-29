"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { galleryAlbumSchema, galleryImageSchema, fieldErrors } from "@/lib/validation";
import { audit } from "@/lib/audit";

async function actorId() {
  const s = await auth();
  return s?.user?.id ?? null;
}

export type FormResult =
  | { ok: false; errors?: Record<string, string>; error?: string }
  | { ok: true; message?: string };

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "album";
}

export async function createAlbum(_prev: FormResult | null, formData: FormData): Promise<FormResult> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const parsed = galleryAlbumSchema.safeParse({ title, slug: slugify(title), description });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  // ensure unique slug
  let slug = parsed.data.slug;
  let n = 1;
  while (await prisma.galleryAlbum.findUnique({ where: { slug } })) slug = `${parsed.data.slug}-${++n}`;

  const count = await prisma.galleryAlbum.count();
  const album = await prisma.galleryAlbum.create({
    data: { title: parsed.data.title, slug, description: parsed.data.description ?? null, sortOrder: count },
  });
  await audit({ actorUserId: await actorId(), action: "CREATE", entityType: "Gallery", entityId: album.id, metadata: { title } });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { ok: true, message: "Album created." };
}

export async function deleteAlbum(id: string) {
  await prisma.galleryAlbum.delete({ where: { id } });
  await audit({ actorUserId: await actorId(), action: "DELETE", entityType: "Gallery", entityId: id });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function updateImageMeta(_prev: FormResult | null, formData: FormData): Promise<FormResult> {
  const parsed = galleryImageSchema.safeParse({
    id: formData.get("id") ?? "",
    alt: formData.get("alt") ?? "",
    caption: formData.get("caption") ?? "",
    year: formData.get("year") || undefined,
    isFeatured: formData.get("isFeatured") === "on",
    sortOrder: formData.get("sortOrder") ?? "0",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  await prisma.galleryImage.update({
    where: { id: d.id },
    data: {
      alt: d.alt,
      caption: d.caption ?? null,
      year: d.year ?? null,
      isFeatured: !!d.isFeatured,
      sortOrder: d.sortOrder,
    },
  });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { ok: true, message: "Saved." };
}

export async function deleteImage(id: string) {
  await prisma.galleryImage.delete({ where: { id } });
  await audit({ actorUserId: await actorId(), action: "DELETE", entityType: "Gallery", entityId: id });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

/**
 * Upload an optimized image (already resized + EXIF-stripped on the client) to
 * Vercel Blob and record its metadata. Requires BLOB_READ_WRITE_TOKEN.
 */
export async function uploadImage(formData: FormData): Promise<FormResult> {
  const albumId = String(formData.get("albumId") ?? "");
  const file = formData.get("file") as File | null;
  const alt = String(formData.get("alt") ?? "").trim() || "Celebration photograph";
  const caption = String(formData.get("caption") ?? "").trim();
  const width = Number(formData.get("width")) || null;
  const height = Number(formData.get("height")) || null;
  const blurData = String(formData.get("blurData") ?? "") || null;

  if (!albumId || !file) return { ok: false, error: "Missing album or file." };
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { ok: false, error: "Image uploads need BLOB_READ_WRITE_TOKEN configured. See the README." };
  }

  try {
    const ext = file.type.includes("webp") ? "webp" : "jpg";
    const key = `gallery/${albumId}/${Date.now()}-${Math.round(width ?? 0)}.${ext}`;
    const blob = await put(key, file, { access: "public", contentType: file.type });

    const count = await prisma.galleryImage.count({ where: { albumId } });
    await prisma.galleryImage.create({
      data: {
        albumId,
        url: blob.url,
        thumbUrl: blob.url, // next/image generates responsive sizes from this source
        blurData,
        width,
        height,
        alt,
        caption: caption || null,
        sortOrder: count,
        isPlaceholder: false,
      },
    });
    await audit({ actorUserId: await actorId(), action: "CREATE", entityType: "Gallery", entityId: albumId, metadata: { uploaded: key } });
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return { ok: true, message: "Uploaded." };
  } catch (e) {
    return { ok: false, error: `Upload failed: ${(e as Error).message}` };
  }
}
