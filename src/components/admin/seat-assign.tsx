"use client";

import { Select } from "@/components/ui/field";
import { assignGuest } from "@/app/admin/(panel)/seating/actions";

/** A guest row with a table dropdown that assigns on change. */
export function SeatAssign({
  guestId,
  tables,
  current,
}: {
  guestId: string;
  tables: { id: string; name: string }[];
  current?: string;
}) {
  return (
    <form action={assignGuest}>
      <input type="hidden" name="guestId" value={guestId} />
      <Select
        name="tableId"
        defaultValue={current ?? ""}
        className="h-9 w-44 text-sm"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        <option value="" disabled>
          Assign to table…
        </option>
        {tables.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>
    </form>
  );
}
