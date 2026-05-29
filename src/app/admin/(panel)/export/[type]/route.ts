import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const { type } = await params;
  let rows: Record<string, unknown>[] = [];
  let columns: string[] | undefined;
  let filename = "export.csv";

  if (type === "guests") {
    const guests = await prisma.guest.findMany({ include: { household: true }, orderBy: { lastName: "asc" } });
    rows = guests.map((g) => ({
      householdName: g.household.name,
      invitationCode: g.household.invitationCode,
      firstName: g.firstName,
      lastName: g.lastName,
      relationship: g.relationship ?? "",
      ageGroup: g.ageGroup,
      rsvpStatus: g.rsvpStatus,
      primaryEmail: g.household.primaryEmail ?? "",
      primaryPhone: g.household.primaryPhone ?? "",
      maxPartySize: g.household.maxPartySize,
    }));
    columns = ["householdName", "invitationCode", "firstName", "lastName", "relationship", "ageGroup", "rsvpStatus", "primaryEmail", "primaryPhone", "maxPartySize"];
    filename = "guest-list.csv";
  } else if (type === "rsvps") {
    const subs = await prisma.rsvpSubmission.findMany({ include: { household: true }, orderBy: { updatedAt: "desc" } });
    rows = subs.map((s) => ({
      household: s.household.name,
      invitationCode: s.household.invitationCode,
      status: s.status,
      partySize: s.partySize,
      submittedBy: s.submittedByName ?? "",
      email: s.submittedByEmail ?? "",
      phone: s.submittedByPhone ?? "",
      message: s.message ?? "",
      updatedAt: s.updatedAt.toISOString(),
    }));
    columns = ["household", "invitationCode", "status", "partySize", "submittedBy", "email", "phone", "message", "updatedAt"];
    filename = "rsvp-status.csv";
  } else if (type === "meals") {
    const guests = await prisma.guest.findMany({
      where: { rsvpStatus: "ATTENDING" },
      include: { household: true },
      orderBy: [{ household: { name: "asc" } }],
    });
    rows = guests.map((g) => ({
      household: g.household.name,
      guest: `${g.firstName} ${g.lastName}`,
      meal: g.mealChoice ?? "STANDARD",
      allergies: g.allergies ?? "",
      accessibility: g.accessibility ?? "",
      notes: g.notes ?? "",
    }));
    columns = ["household", "guest", "meal", "allergies", "accessibility", "notes"];
    filename = "meals-and-needs.csv";
  } else if (type === "seating") {
    const tables = await prisma.table.findMany({
      include: { seats: { include: { guest: { include: { household: true } } } } },
      orderBy: { sortOrder: "asc" },
    });
    rows = tables.flatMap((t) =>
      t.seats.length
        ? t.seats.map((s) => ({
            table: t.name,
            capacity: t.capacity,
            guest: `${s.guest.firstName} ${s.guest.lastName}`,
            household: s.guest.household.name,
            seatNo: s.seatNo ?? "",
          }))
        : [{ table: t.name, capacity: t.capacity, guest: "(empty)", household: "", seatNo: "" }],
    );
    columns = ["table", "capacity", "guest", "household", "seatNo"];
    filename = "seating-chart.csv";
  } else {
    return new NextResponse("Unknown export type", { status: 404 });
  }

  // Prepend a UTF-8 BOM so Excel detects the encoding and renders accented
  // characters, em-dashes (—), the "·" separator, etc. correctly.
  const csv = "﻿" + toCsv(rows, columns);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
