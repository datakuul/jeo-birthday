import Link from "next/link";
import { Plus, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { GuestsTable, type GuestRow } from "@/components/admin/guests-table";
import { ImportGuests } from "@/components/admin/import-guests";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const MEAL_LABELS: Record<string, string> = {
  STANDARD: "Standard",
  VEGETARIAN: "Vegetarian",
  VEGAN: "Vegan",
  HALAL: "Halal",
  CHILD: "Child",
};

export default async function GuestsPage() {
  const guests = await prisma.guest.findMany({
    include: { household: true },
    orderBy: [{ household: { name: "asc" } }, { lastName: "asc" }],
  });

  const rows: GuestRow[] = guests.map((g) => ({
    id: g.id,
    householdId: g.householdId,
    householdName: g.household.name,
    invitationCode: g.household.invitationCode,
    name: `${g.firstName} ${g.lastName}`.trim(),
    relationship: g.relationship ?? "",
    ageGroup: g.ageGroup,
    rsvpStatus: g.rsvpStatus,
    meal: g.rsvpStatus === "ATTENDING" ? MEAL_LABELS[g.mealChoice ?? "STANDARD"] ?? "" : "",
  }));

  return (
    <div>
      <PageHeader
        title="Guests & Households"
        subtitle={`${guests.length} guests across the guest list.`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="/admin/export/guests" download>
                <Download className="size-4" />
                Export
              </a>
            </Button>
            <Button asChild variant="gold" size="sm">
              <Link href="/admin/guests/new">
                <Plus className="size-4" />
                New household
              </Link>
            </Button>
          </div>
        }
      />

      <div className="mb-6">
        <ImportGuests />
      </div>

      <GuestsTable data={rows} />
    </div>
  );
}
