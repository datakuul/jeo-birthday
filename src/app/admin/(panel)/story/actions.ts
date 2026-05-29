"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { storyChapterSchema, fieldErrors } from "@/lib/validation";
import { audit } from "@/lib/audit";

async function actorId() {
  const s = await auth();
  return s?.user?.id ?? null;
}

export type FormResult =
  | { ok: false; errors?: Record<string, string>; error?: string }
  | { ok: true; message?: string };

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "chapter";
}

function parse(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  return storyChapterSchema.safeParse({
    title,
    slug: slugInput || slugify(title),
    years: formData.get("years") ?? "",
    quote: formData.get("quote") ?? "",
    body: formData.get("body") ?? "",
    image: formData.get("image") ?? "",
    sortOrder: formData.get("sortOrder") ?? "0",
    published: formData.get("published") === "on",
  });
}

export async function createChapter(_prev: FormResult | null, formData: FormData): Promise<FormResult> {
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  let slug = parsed.data.slug;
  let n = 1;
  while (await prisma.storyChapter.findUnique({ where: { slug } })) slug = `${parsed.data.slug}-${++n}`;
  const count = await prisma.storyChapter.count();
  const chapter = await prisma.storyChapter.create({
    data: { ...parsed.data, slug, sortOrder: count },
  });
  await audit({ actorUserId: await actorId(), action: "CREATE", entityType: "Story", entityId: chapter.id });
  revalidatePath("/admin/story");
  revalidatePath("/story");
  redirect("/admin/story");
}

export async function updateChapter(id: string, _prev: FormResult | null, formData: FormData): Promise<FormResult> {
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const clash = await prisma.storyChapter.findUnique({ where: { slug: parsed.data.slug } });
  if (clash && clash.id !== id) return { ok: false, errors: { slug: "That slug is already in use." } };
  await prisma.storyChapter.update({ where: { id }, data: parsed.data });
  await audit({ actorUserId: await actorId(), action: "UPDATE", entityType: "Story", entityId: id });
  revalidatePath("/admin/story");
  revalidatePath("/story");
  return { ok: true, message: "Saved." };
}

export async function deleteChapter(id: string) {
  await prisma.storyChapter.delete({ where: { id } });
  await audit({ actorUserId: await actorId(), action: "DELETE", entityType: "Story", entityId: id });
  revalidatePath("/admin/story");
  revalidatePath("/story");
}

export async function togglePublish(id: string, published: boolean) {
  await prisma.storyChapter.update({ where: { id }, data: { published } });
  revalidatePath("/admin/story");
  revalidatePath("/story");
}

export async function moveChapter(id: string, dir: "up" | "down") {
  const chapters = await prisma.storyChapter.findMany({ orderBy: { sortOrder: "asc" } });
  const idx = chapters.findIndex((c) => c.id === id);
  if (idx === -1) return;
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= chapters.length) return;
  const a = chapters[idx];
  const b = chapters[swapIdx];
  await prisma.$transaction([
    prisma.storyChapter.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.storyChapter.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);
  revalidatePath("/admin/story");
  revalidatePath("/story");
}
