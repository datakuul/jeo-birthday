"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { householdSchema, guestSchema, fieldErrors } from "@/lib/validation";
import { generateInvitationCode, normalizeCode } from "@/lib/codes";
import { parseCsv } from "@/lib/csv";
import { audit } from "@/lib/audit";

async function actorId() {
  const s = await auth();
  return s?.user?.id ?? null;
}

export type FormResult =
  | { ok: false; errors?: Record<string, string>; error?: string }
  | { ok: true; id?: string; message?: string };

async function uniqueCode(preferred?: string) {
  if (preferred) {
    const code = normalizeCode(preferred);
    const exists = await prisma.household.findUnique({ where: { invitationCode: code } });
    if (!exists) return code;
  }
  for (let i = 0; i < 20; i++) {
    const code = generateInvitationCode();
    const exists = await prisma.household.findUnique({ where: { invitationCode: code } });
    if (!exists) return code;
  }
  return generateInvitationCode(`JN${Date.now() % 100}`);
}

export async function createHousehold(_prev: FormResult | null, formData: FormData): Promise<FormResult> {
  const parsed = householdSchema.safeParse({
    name: formData.get("name") ?? "",
    invitationCode: formData.get("invitationCode") ?? "",
    primaryContactName: formData.get("primaryContactName") ?? "",
    primaryEmail: formData.get("primaryEmail") ?? "",
    primaryPhone: formData.get("primaryPhone") ?? "",
    maxPartySize: formData.get("maxPartySize") ?? "2",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const code = await uniqueCode(d.invitationCode);
  const household = await prisma.household.create({
    data: {
      name: d.name,
      invitationCode: code,
      primaryContactName: d.primaryContactName ?? null,
      primaryEmail: d.primaryEmail && d.primaryEmail !== "" ? d.primaryEmail : null,
      primaryPhone: d.primaryPhone ?? null,
      maxPartySize: d.maxPartySize,
      notes: d.notes ?? null,
    },
  });
  await audit({ actorUserId: await actorId(), action: "CREATE", entityType: "Household", entityId: household.id, metadata: { name: d.name } });
  revalidatePath("/admin/guests");
  redirect(`/admin/guests/${household.id}`);
}

export async function updateHousehold(id: string, _prev: FormResult | null, formData: FormData): Promise<FormResult> {
  const parsed = householdSchema.safeParse({
    name: formData.get("name") ?? "",
    invitationCode: formData.get("invitationCode") ?? "",
    primaryContactName: formData.get("primaryContactName") ?? "",
    primaryEmail: formData.get("primaryEmail") ?? "",
    primaryPhone: formData.get("primaryPhone") ?? "",
    maxPartySize: formData.get("maxPartySize") ?? "2",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  // Keep existing code unless a (unique) new one is given.
  const current = await prisma.household.findUnique({ where: { id } });
  if (!current) return { ok: false, error: "Household not found." };
  let code = current.invitationCode;
  if (d.invitationCode && normalizeCode(d.invitationCode) !== current.invitationCode) {
    const wanted = normalizeCode(d.invitationCode);
    const clash = await prisma.household.findUnique({ where: { invitationCode: wanted } });
    if (clash) return { ok: false, errors: { invitationCode: "That code is already in use." } };
    code = wanted;
  }

  await prisma.household.update({
    where: { id },
    data: {
      name: d.name,
      invitationCode: code,
      primaryContactName: d.primaryContactName ?? null,
      primaryEmail: d.primaryEmail && d.primaryEmail !== "" ? d.primaryEmail : null,
      primaryPhone: d.primaryPhone ?? null,
      maxPartySize: d.maxPartySize,
      notes: d.notes ?? null,
    },
  });
  await audit({ actorUserId: await actorId(), action: "UPDATE", entityType: "Household", entityId: id });
  revalidatePath("/admin/guests");
  revalidatePath(`/admin/guests/${id}`);
  return { ok: true, message: "Saved." };
}

export async function deleteHousehold(id: string): Promise<void> {
  await prisma.household.delete({ where: { id } });
  await audit({ actorUserId: await actorId(), action: "DELETE", entityType: "Household", entityId: id });
  revalidatePath("/admin/guests");
  redirect("/admin/guests");
}

export async function addGuest(householdId: string, _prev: FormResult | null, formData: FormData): Promise<FormResult> {
  const parsed = guestSchema.safeParse({
    householdId,
    firstName: formData.get("firstName") ?? "",
    lastName: formData.get("lastName") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    relationship: formData.get("relationship") ?? "",
    ageGroup: formData.get("ageGroup") ?? "ADULT",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  await prisma.guest.create({
    data: {
      householdId,
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email && d.email !== "" ? d.email : null,
      phone: d.phone ?? null,
      relationship: d.relationship ?? null,
      ageGroup: d.ageGroup,
    },
  });
  await audit({ actorUserId: await actorId(), action: "CREATE", entityType: "Guest", entityId: householdId });
  revalidatePath(`/admin/guests/${householdId}`);
  return { ok: true, message: "Guest added." };
}

export async function deleteGuest(id: string, householdId: string): Promise<void> {
  await prisma.guest.delete({ where: { id } });
  await audit({ actorUserId: await actorId(), action: "DELETE", entityType: "Guest", entityId: id });
  revalidatePath(`/admin/guests/${householdId}`);
}

/**
 * Import guests from CSV. Columns: householdName, invitationCode,
 * primaryContactName, primaryEmail, primaryPhone, maxPartySize, firstName,
 * lastName, relationship, ageGroup, notes. Rows are grouped into households by
 * householdName (or invitationCode).
 */
export async function importGuestsCsv(_prev: FormResult | null, formData: FormData): Promise<FormResult> {
  const text = String(formData.get("csv") ?? "").trim();
  if (!text) return { ok: false, error: "Please paste CSV content or upload a file." };

  let rows: Record<string, string>[];
  try {
    rows = parseCsv(text);
  } catch {
    return { ok: false, error: "Could not parse the CSV." };
  }
  if (!rows.length) return { ok: false, error: "No rows found in the CSV." };

  let households = 0;
  let guests = 0;

  // group by household
  const groups = new Map<string, Record<string, string>[]>();
  for (const r of rows) {
    const key = (r.householdName || r.invitationCode || `${r.lastName}-${r.primaryPhone}`).trim();
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  for (const [, members] of groups) {
    const first = members[0];
    const name = first.householdName || `${first.firstName} ${first.lastName}'s Household`;
    const code = await uniqueCode(first.invitationCode);
    const maxParty = Number(first.maxPartySize) || Math.max(members.length, 1);

    const household = await prisma.household.create({
      data: {
        name,
        invitationCode: code,
        primaryContactName: first.primaryContactName || null,
        primaryEmail: first.primaryEmail || null,
        primaryPhone: first.primaryPhone || null,
        maxPartySize: maxParty,
        notes: first.notes || null,
        guests: {
          create: members
            .filter((m) => m.firstName || m.lastName)
            .map((m) => ({
              firstName: m.firstName || "Guest",
              lastName: m.lastName || "",
              relationship: m.relationship || null,
              ageGroup: (m.ageGroup || "ADULT").toUpperCase() === "CHILD" ? "CHILD" : "ADULT",
            })),
        },
      },
      include: { guests: true },
    });
    households++;
    guests += household.guests.length;
  }

  await audit({ actorUserId: await actorId(), action: "IMPORT", entityType: "Household", metadata: { households, guests } });
  revalidatePath("/admin/guests");
  return { ok: true, message: `Imported ${households} household(s) and ${guests} guest(s).` };
}
