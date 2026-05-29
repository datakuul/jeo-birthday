"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  rsvpLookupSchema,
  rsvpSubmissionSchema,
  fieldErrors,
} from "@/lib/validation";
import { normalizeCode, hashIp } from "@/lib/codes";
import { audit } from "@/lib/audit";
import { sendRsvpConfirmation } from "@/lib/email";

export type LookupResult =
  | { ok: false; error: string }
  | {
      ok: true;
      household: {
        id: string;
        name: string;
        invitationCode: string;
        maxPartySize: number;
        primaryEmail: string | null;
        primaryPhone: string | null;
        guests: {
          id: string;
          firstName: string;
          lastName: string;
          relationship: string | null;
          ageGroup: string;
          rsvpStatus: string;
          mealChoice: string | null;
          allergies: string | null;
          accessibility: string | null;
          notes: string | null;
        }[];
      };
    };

/** Look up a household by invitation code, surname, email, or phone. */
export async function lookupHousehold(
  _prev: unknown,
  formData: FormData,
): Promise<LookupResult> {
  const parsed = rsvpLookupSchema.safeParse({
    invitationCode: formData.get("invitationCode") ?? "",
    surname: formData.get("surname") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: Object.values(fieldErrors(parsed.error))[0] ?? "Invalid search" };
  }
  const { invitationCode, surname, email, phone } = parsed.data;

  let household = null;

  if (invitationCode) {
    household = await prisma.household.findUnique({
      where: { invitationCode: normalizeCode(invitationCode) },
      include: { guests: { orderBy: { createdAt: "asc" } } },
    });
  }

  if (!household && (email || phone || surname)) {
    household = await prisma.household.findFirst({
      where: {
        OR: [
          email ? { primaryEmail: { equals: email } } : {},
          phone ? { primaryPhone: { contains: phone } } : {},
          surname ? { guests: { some: { lastName: { equals: surname } } } } : {},
          surname ? { name: { contains: surname } } : {},
        ].filter((c) => Object.keys(c).length),
      },
      include: { guests: { orderBy: { createdAt: "asc" } } },
    });
  }

  if (!household) {
    return {
      ok: false,
      error:
        "We couldn't find your invitation. Please check your details, or contact the host for help.",
    };
  }

  return {
    ok: true,
    household: {
      id: household.id,
      name: household.name,
      invitationCode: household.invitationCode,
      maxPartySize: household.maxPartySize,
      primaryEmail: household.primaryEmail,
      primaryPhone: household.primaryPhone,
      guests: household.guests.map((g) => ({
        id: g.id,
        firstName: g.firstName,
        lastName: g.lastName,
        relationship: g.relationship,
        ageGroup: g.ageGroup,
        rsvpStatus: g.rsvpStatus,
        mealChoice: g.mealChoice,
        allergies: g.allergies,
        accessibility: g.accessibility,
        notes: g.notes,
      })),
    },
  };
}

export type SubmitResult =
  | { ok: false; errors?: Record<string, string>; error?: string }
  | { ok: true; summary: { attending: number; declined: number; total: number } };

export async function submitRsvp(payload: unknown): Promise<SubmitResult> {
  const parsed = rsvpSubmissionSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }
  const data = parsed.data;

  // Verify the household + invitation code match (don't trust the client id alone).
  const household = await prisma.household.findUnique({
    where: { id: data.householdId },
    include: { guests: true },
  });
  if (!household || household.invitationCode !== normalizeCode(data.invitationCode)) {
    return { ok: false, error: "Your invitation could not be verified. Please look up your household again." };
  }

  // Only allow responding for guests that belong to this household.
  const ownedIds = new Set(household.guests.map((g) => g.id));
  const submissions = data.guests.filter((g) => ownedIds.has(g.guestId));
  if (!submissions.length) {
    return { ok: false, error: "No valid guests to respond for." };
  }

  const wasResponded = await prisma.rsvpSubmission.findUnique({
    where: { householdId: household.id },
  });

  // Respect maxPartySize for attendees.
  const attendingCount = submissions.filter((s) => s.rsvpStatus === "ATTENDING").length;
  if (attendingCount > household.maxPartySize) {
    return {
      ok: false,
      error: `This invitation allows up to ${household.maxPartySize} attending guest${
        household.maxPartySize === 1 ? "" : "s"
      }. Please adjust your selection.`,
    };
  }

  await prisma.$transaction(
    submissions.map((g) =>
      prisma.guest.update({
        where: { id: g.guestId },
        data: {
          rsvpStatus: g.rsvpStatus,
          mealChoice: g.rsvpStatus === "ATTENDING" ? g.mealChoice ?? "STANDARD" : null,
          allergies: g.allergies ?? null,
          accessibility: g.accessibility ?? null,
          notes: g.notes ?? null,
        },
      }),
    ),
  );

  const declinedCount = submissions.filter((s) => s.rsvpStatus === "DECLINED").length;
  const overallStatus =
    attendingCount > 0 && declinedCount > 0
      ? "PARTIAL"
      : attendingCount > 0
        ? "ATTENDING"
        : submissions.some((s) => s.rsvpStatus === "MAYBE")
          ? "MAYBE"
          : "DECLINED";

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0] ?? hdrs.get("x-real-ip");

  await prisma.rsvpSubmission.upsert({
    where: { householdId: household.id },
    update: {
      status: overallStatus,
      partySize: attendingCount,
      submittedByName: data.submittedByName,
      submittedByEmail: data.submittedByEmail,
      submittedByPhone: data.submittedByPhone ?? null,
      message: data.message ?? null,
      ipHash: hashIp(ip),
    },
    create: {
      householdId: household.id,
      status: overallStatus,
      partySize: attendingCount,
      submittedByName: data.submittedByName,
      submittedByEmail: data.submittedByEmail,
      submittedByPhone: data.submittedByPhone ?? null,
      message: data.message ?? null,
      ipHash: hashIp(ip),
    },
  });

  await audit({
    action: wasResponded ? "UPDATE" : "CREATE",
    entityType: "Rsvp",
    entityId: household.id,
    metadata: { attending: attendingCount, declined: declinedCount, by: data.submittedByName },
  });

  // Confirmation email (non-blocking on failure).
  const guestLines = submissions.map((s) => {
    const g = household.guests.find((x) => x.id === s.guestId)!;
    return { name: `${g.firstName} ${g.lastName}`, status: s.rsvpStatus, meal: s.mealChoice };
  });
  await sendRsvpConfirmation({
    to: data.submittedByEmail,
    name: data.submittedByName,
    isUpdate: !!wasResponded,
    guests: guestLines,
    message: data.message,
  });

  return {
    ok: true,
    summary: {
      attending: attendingCount,
      declined: declinedCount,
      total: submissions.length,
    },
  };
}
