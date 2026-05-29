"use client";

import { useActionState, useRef, useEffect } from "react";
import { Loader2, UserPlus, Trash2 } from "lucide-react";
import { addGuest, deleteGuest, type FormResult } from "@/app/admin/(panel)/guests/actions";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/admin/ui";

export type GuestItem = {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string | null;
  ageGroup: string;
  rsvpStatus: string;
};

export function GuestManager({
  householdId,
  guests,
}: {
  householdId: string;
  guests: GuestItem[];
}) {
  const add = addGuest.bind(null, householdId);
  const [state, action, pending] = useActionState<FormResult | null, FormData>(add, null);
  const formRef = useRef<HTMLFormElement>(null);
  const errs = state && !state.ok ? state.errors : undefined;

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="mb-3 font-serif text-lg">Guests ({guests.length})</h3>
        {guests.length ? (
          <ul className="divide-y divide-border/60">
            {guests.map((g) => (
              <li key={g.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="font-medium text-foreground">
                    {g.firstName} {g.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {g.relationship || "—"} · {g.ageGroup}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={g.rsvpStatus} />
                  <form action={deleteGuest.bind(null, g.id, householdId)}>
                    <button
                      type="submit"
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Remove ${g.firstName}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No guests yet — add the first one below.</p>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 font-serif text-lg">Add a guest</h3>
        <form ref={formRef} action={action} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First name *</Label>
              <Input id="firstName" name="firstName" required aria-invalid={!!errs?.firstName} />
            </div>
            <div>
              <Label htmlFor="lastName">Last name *</Label>
              <Input id="lastName" name="lastName" required aria-invalid={!!errs?.lastName} />
            </div>
            <div>
              <Label htmlFor="relationship">Relationship</Label>
              <Input id="relationship" name="relationship" placeholder="e.g. Daughter" />
            </div>
            <div>
              <Label htmlFor="ageGroup">Age group</Label>
              <Select id="ageGroup" name="ageGroup" defaultValue="ADULT">
                <option value="ADULT">Adult</option>
                <option value="CHILD">Child</option>
                <option value="INFANT">Infant</option>
              </Select>
            </div>
          </div>
          {state && !state.ok && state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button type="submit" variant="outline" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            Add guest
          </Button>
        </form>
      </Card>
    </div>
  );
}
