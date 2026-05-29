import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { HouseholdForm } from "@/components/admin/household-form";
import { GuestManager } from "@/components/admin/guest-manager";
import { updateHousehold, deleteHousehold } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditHouseholdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const household = await prisma.household.findUnique({
    where: { id },
    include: { guests: { orderBy: { createdAt: "asc" } } },
  });
  if (!household) notFound();

  const update = updateHousehold.bind(null, id);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/guests" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to guests
      </Link>
      <PageHeader
        title={household.name}
        subtitle={`Invitation code: ${household.invitationCode}`}
        action={
          <form action={deleteHousehold.bind(null, id)}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Delete household
            </button>
          </form>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-serif text-lg">Household details</h2>
          <HouseholdForm
            action={update}
            submitLabel="Save changes"
            initial={{
              name: household.name,
              invitationCode: household.invitationCode,
              primaryContactName: household.primaryContactName ?? undefined,
              primaryEmail: household.primaryEmail ?? undefined,
              primaryPhone: household.primaryPhone ?? undefined,
              maxPartySize: household.maxPartySize,
              notes: household.notes ?? undefined,
            }}
          />
        </div>
        <div>
          <h2 className="mb-3 font-serif text-lg">Members</h2>
          <GuestManager
            householdId={id}
            guests={household.guests.map((g) => ({
              id: g.id,
              firstName: g.firstName,
              lastName: g.lastName,
              relationship: g.relationship,
              ageGroup: g.ageGroup,
              rsvpStatus: g.rsvpStatus,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
