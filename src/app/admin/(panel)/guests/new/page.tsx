import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { HouseholdForm } from "@/components/admin/household-form";
import { createHousehold } from "../actions";

export const dynamic = "force-dynamic";

export default function NewHouseholdPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/guests" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to guests
      </Link>
      <PageHeader title="New household" subtitle="Create a household, then add its guests." />
      <HouseholdForm action={createHousehold} submitLabel="Create household" />
    </div>
  );
}
