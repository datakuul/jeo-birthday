"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { openRsvpSchema, fieldErrors } from "@/lib/validation";
import { generateInvitationCode, hashIp, normalizePhone } from "@/lib/codes";
import { audit } from "@/lib/audit";
import { sendRsvpConfirmation } from "@/lib/email";

export type SubmitResult =
  | { ok: false; errors?: Record<string, string>; error?: string }
  | { ok: true; summary: { attending: number; declined: number; total: number } };

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}

async function uniqueCode(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const code = generateInvitationCode();
    const exists = await prisma.household.findUnique({ where: { invitationCode: code } });
    if (!exists) return code;
  }
  return generateInvitationCode(`JN${Date.now() % 1000}`);
}

/**
 * Open RSVP — the responder enters their own details and (optionally) the adult
 * guests they are bringing. Creates (or, for the same email, updates) a
 * Household + Guests + RsvpSubmission so the admin tools keep working as before.
 */
export async function submitOpenRsvp(payload: unknown): Promise<SubmitResult> {
  const parsed = openRsvpSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }
  const d = parsed.data;

  // --- Spam protection (kept light so it never blocks real guests) ----------
  // 1) Honeypot: bots fill the hidden "website" field. Silently accept.
  if (d.website) {
    return { ok: true, summary: { attending: 0, declined: 0, total: 0 } };
  }
  // 2) Time-trap: humans take more than a couple of seconds to fill the form;
  //    automated submissions fire near-instantly. Silently accept (don't tip off).
  if (d.renderedAt && Date.now() - d.renderedAt < 2500) {
    return { ok: true, summary: { attending: 0, declined: 0, total: 0 } };
  }

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0] ?? hdrs.get("x-real-ip");
  const ipHash = hashIp(ip);

  // 3) Flood backstop — generous, because Nigerian mobile carriers share IPs
  //    (CGNAT). Only stops a runaway bot, not a big family on one network.
  try {
    const recent = await prisma.rsvpSubmission.count({
      where: { ipHash, submittedAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } },
    });
    if (recent >= 30) {
      return {
        ok: false,
        error: "We've received a lot of responses from your network. Please try again shortly, or contact the host.",
      };
    }
  } catch {
    /* never block a real RSVP on the rate-limit check */
  }

  const phone = normalizePhone(d.phone);
  const attending = d.rsvpStatus === "ATTENDING";
  // Only count/keep guests when the responder is actually attending.
  const extraGuests = attending ? d.guests.filter((g) => g.name.trim()) : [];
  const partySize = attending ? 1 + extraGuests.length : 0;

  const me = splitName(d.fullName);
  const primaryGuest = {
    firstName: me.firstName,
    lastName: me.lastName,
    email: d.email ?? null,
    phone: phone,
    relationship: "Self",
    ageGroup: "ADULT",
    inviteStatus: "INVITED",
    rsvpStatus: d.rsvpStatus,
    mealChoice: attending ? d.mealChoice ?? "STANDARD" : null,
    allergies: d.allergies ?? null,
    accessibility: d.accessibility ?? null,
  };
  const guestRows = extraGuests.map((g) => {
    const n = splitName(g.name);
    return {
      firstName: n.firstName,
      lastName: n.lastName,
      relationship: "Guest",
      ageGroup: "ADULT",
      inviteStatus: "INVITED",
      rsvpStatus: "ATTENDING",
      mealChoice: g.mealChoice ?? "STANDARD",
    };
  });

  const overallStatus = d.rsvpStatus;

  // If this phone already responded, update that household (lets guests edit by
  // re-submitting with the same number) — otherwise create a fresh one. This
  // also stops accidental/abusive duplicates from the same person.
  const existing = await prisma.household.findFirst({
    where: { primaryPhone: { equals: phone } },
  });

  let householdId: string;
  if (existing) {
    householdId = existing.id;
    await prisma.guest.deleteMany({ where: { householdId } });
    await prisma.household.update({
      where: { id: householdId },
      data: {
        name: `${d.fullName}${extraGuests.length ? " & party" : ""}`,
        primaryContactName: d.fullName,
        primaryEmail: d.email ?? null,
        primaryPhone: phone,
        maxPartySize: Math.max(1, partySize),
        guests: { create: [primaryGuest, ...guestRows] },
      },
    });
  } else {
    const created = await prisma.household.create({
      data: {
        name: `${d.fullName}${extraGuests.length ? " & party" : ""}`,
        invitationCode: await uniqueCode(),
        primaryContactName: d.fullName,
        primaryEmail: d.email ?? null,
        primaryPhone: phone,
        maxPartySize: Math.max(1, partySize),
        guests: { create: [primaryGuest, ...guestRows] },
      },
    });
    householdId = created.id;
  }

  await prisma.rsvpSubmission.upsert({
    where: { householdId },
    update: {
      status: overallStatus,
      partySize,
      submittedByName: d.fullName,
      submittedByEmail: d.email ?? null,
      submittedByPhone: phone,
      message: d.message ?? null,
      ipHash,
    },
    create: {
      householdId,
      status: overallStatus,
      partySize,
      submittedByName: d.fullName,
      submittedByEmail: d.email ?? null,
      submittedByPhone: phone,
      message: d.message ?? null,
      ipHash,
    },
  });

  await audit({
    action: existing ? "UPDATE" : "CREATE",
    entityType: "Rsvp",
    entityId: householdId,
    metadata: { by: d.fullName, status: overallStatus, partySize },
  });

  // Confirmation email — only if they gave one (email is optional). Never blocks.
  if (d.email) {
    const emailGuests = [
      { name: d.fullName, status: d.rsvpStatus, meal: primaryGuest.mealChoice },
      ...guestRows.map((g) => ({
        name: `${g.firstName} ${g.lastName}`.trim(),
        status: "ATTENDING",
        meal: g.mealChoice,
      })),
    ];
    await sendRsvpConfirmation({
      to: d.email,
      name: d.fullName,
      isUpdate: !!existing,
      guests: emailGuests,
      message: d.message,
    });
  }

  return {
    ok: true,
    summary: {
      attending: partySize,
      declined: attending ? 0 : 1,
      total: attending ? partySize : 1,
    },
  };
}
