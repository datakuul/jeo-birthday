"use client";

import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { StatusPill } from "@/components/admin/ui";

export type GuestRow = {
  id: string;
  householdId: string;
  householdName: string;
  invitationCode: string;
  name: string;
  relationship: string;
  ageGroup: string;
  rsvpStatus: string;
  meal: string;
};

const columns: ColumnDef<GuestRow>[] = [
  {
    accessorKey: "name",
    header: "Guest",
    cell: ({ row }) => (
      <Link href={`/admin/guests/${row.original.householdId}`} className="font-medium text-foreground hover:text-gold-strong">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "householdName",
    header: "Household",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.householdName}</span>
    ),
  },
  { accessorKey: "relationship", header: "Relationship" },
  {
    accessorKey: "ageGroup",
    header: "Age",
    cell: ({ row }) => <span className="text-xs uppercase text-muted-foreground">{row.original.ageGroup}</span>,
  },
  {
    accessorKey: "rsvpStatus",
    header: "RSVP",
    cell: ({ row }) => <StatusPill status={row.original.rsvpStatus} />,
  },
  { accessorKey: "meal", header: "Meal" },
  {
    accessorKey: "invitationCode",
    header: "Code",
    cell: ({ row }) => <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">{row.original.invitationCode}</code>,
  },
];

export function GuestsTable({ data }: { data: GuestRow[] }) {
  return <DataTable columns={columns} data={data} searchPlaceholder="Search guests, households, codes…" />;
}
