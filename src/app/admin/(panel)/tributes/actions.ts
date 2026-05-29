"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { audit } from "@/lib/audit";

async function actorId() {
  const s = await auth();
  return s?.user?.id ?? null;
}

export async function setTributeStatus(id: string, status: string) {
  await prisma.tribute.update({ where: { id }, data: { status } });
  await audit({
    actorUserId: await actorId(),
    action: status === "APPROVED" ? "APPROVE" : status === "REJECTED" ? "REJECT" : "UPDATE",
    entityType: "Tribute",
    entityId: id,
    metadata: { status },
  });
  revalidatePath("/admin/tributes");
  revalidatePath("/tributes");
}

export async function toggleFeatured(id: string, isFeatured: boolean) {
  await prisma.tribute.update({ where: { id }, data: { isFeatured } });
  revalidatePath("/admin/tributes");
  revalidatePath("/tributes");
}

export async function deleteTribute(id: string) {
  await prisma.tribute.delete({ where: { id } });
  await audit({ actorUserId: await actorId(), action: "DELETE", entityType: "Tribute", entityId: id });
  revalidatePath("/admin/tributes");
  revalidatePath("/tributes");
}
