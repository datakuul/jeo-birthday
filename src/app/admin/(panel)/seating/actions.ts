"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { tableSchema, fieldErrors } from "@/lib/validation";
import { audit } from "@/lib/audit";

async function actorId() {
  const s = await auth();
  return s?.user?.id ?? null;
}

export type FormResult =
  | { ok: false; errors?: Record<string, string>; error?: string }
  | { ok: true };

export async function createTable(_prev: FormResult | null, formData: FormData): Promise<FormResult> {
  const parsed = tableSchema.safeParse({
    name: formData.get("name") ?? "",
    capacity: formData.get("capacity") ?? "10",
    sortOrder: formData.get("sortOrder") ?? "0",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const count = await prisma.table.count();
  const t = await prisma.table.create({
    data: { name: parsed.data.name, capacity: parsed.data.capacity, sortOrder: count },
  });
  await audit({ actorUserId: await actorId(), action: "CREATE", entityType: "Seating", entityId: t.id, metadata: { name: t.name } });
  revalidatePath("/admin/seating");
  return { ok: true };
}

export async function deleteTable(id: string) {
  await prisma.table.delete({ where: { id } });
  await audit({ actorUserId: await actorId(), action: "DELETE", entityType: "Seating", entityId: id });
  revalidatePath("/admin/seating");
}

export async function assignGuest(formData: FormData) {
  const guestId = String(formData.get("guestId") ?? "");
  const tableId = String(formData.get("tableId") ?? "");
  if (!guestId || !tableId) return;

  // Upsert enforces one seat per guest (guestId is unique) — reassigning moves them.
  await prisma.seatAssignment.upsert({
    where: { guestId },
    update: { tableId },
    create: { guestId, tableId },
  });
  await audit({ actorUserId: await actorId(), action: "UPDATE", entityType: "Seating", entityId: tableId, metadata: { guestId } });
  revalidatePath("/admin/seating");
  revalidatePath("/admin");
}

export async function unassignGuest(guestId: string) {
  await prisma.seatAssignment.deleteMany({ where: { guestId } });
  await audit({ actorUserId: await actorId(), action: "DELETE", entityType: "Seating", entityId: guestId });
  revalidatePath("/admin/seating");
  revalidatePath("/admin");
}
