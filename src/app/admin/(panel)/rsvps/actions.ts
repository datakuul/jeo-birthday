"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { sendRsvpConfirmation } from "@/lib/email";

async function actorId() {
  const s = await auth();
  return s?.user?.id ?? null;
}

export async function setSubmissionStatus(submissionId: string, formData: FormData) {
  const status = String(formData.get("status") ?? "PENDING");
  const sub = await prisma.rsvpSubmission.update({
    where: { id: submissionId },
    data: { status },
  });
  await audit({ actorUserId: await actorId(), action: "UPDATE", entityType: "Rsvp", entityId: sub.householdId, metadata: { status } });
  revalidatePath("/admin/rsvps");
}

export async function setGuestStatus(guestId: string, formData: FormData) {
  const rsvpStatus = String(formData.get("status") ?? "PENDING");
  await prisma.guest.update({ where: { id: guestId }, data: { rsvpStatus } });
  await audit({ actorUserId: await actorId(), action: "UPDATE", entityType: "Guest", entityId: guestId, metadata: { rsvpStatus } });
  revalidatePath("/admin/rsvps");
  revalidatePath("/admin");
}

export async function resendConfirmation(householdId: string) {
  const household = await prisma.household.findUnique({
    where: { id: householdId },
    include: { guests: true, rsvp: true },
  });
  if (!household?.rsvp?.submittedByEmail) return;

  await sendRsvpConfirmation({
    to: household.rsvp.submittedByEmail,
    name: household.rsvp.submittedByName ?? household.name,
    isUpdate: true,
    guests: household.guests.map((g) => ({
      name: `${g.firstName} ${g.lastName}`,
      status: g.rsvpStatus,
      meal: g.mealChoice,
    })),
    message: household.rsvp.message,
  });
  await audit({ actorUserId: await actorId(), action: "UPDATE", entityType: "Rsvp", entityId: householdId, metadata: { resent: true } });
  revalidatePath("/admin/rsvps");
}
