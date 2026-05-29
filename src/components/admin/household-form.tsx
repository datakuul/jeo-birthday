"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import type { FormResult } from "@/app/admin/(panel)/guests/actions";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, FieldError, Hint } from "@/components/ui/field";
import { Card } from "@/components/ui/card";

export type HouseholdValues = {
  name?: string;
  invitationCode?: string;
  primaryContactName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  maxPartySize?: number;
  notes?: string;
};

export function HouseholdForm({
  action,
  initial,
  submitLabel = "Save household",
}: {
  action: (prev: FormResult | null, formData: FormData) => Promise<FormResult>;
  initial?: HouseholdValues;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<FormResult | null, FormData>(action, null);
  const e = state && !state.ok ? state.errors : undefined;

  return (
    <Card className="p-6">
      <form action={formAction} className="space-y-5">
        <div>
          <Label htmlFor="name">Household name *</Label>
          <Input id="name" name="name" defaultValue={initial?.name} required placeholder="e.g. The Olaniru Family" aria-invalid={!!e?.name} />
          <FieldError>{e?.name}</FieldError>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="invitationCode">Invitation code</Label>
            <Input id="invitationCode" name="invitationCode" defaultValue={initial?.invitationCode} placeholder="Auto-generated if blank" aria-invalid={!!e?.invitationCode} />
            <FieldError>{e?.invitationCode}</FieldError>
            <Hint>Leave blank to generate a unique code.</Hint>
          </div>
          <div>
            <Label htmlFor="maxPartySize">Max attending party size</Label>
            <Input id="maxPartySize" name="maxPartySize" type="number" min={1} max={20} defaultValue={initial?.maxPartySize ?? 2} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="primaryContactName">Primary contact</Label>
            <Input id="primaryContactName" name="primaryContactName" defaultValue={initial?.primaryContactName} />
          </div>
          <div>
            <Label htmlFor="primaryEmail">Email</Label>
            <Input id="primaryEmail" name="primaryEmail" type="email" defaultValue={initial?.primaryEmail} aria-invalid={!!e?.primaryEmail} />
            <FieldError>{e?.primaryEmail}</FieldError>
          </div>
          <div>
            <Label htmlFor="primaryPhone">Phone</Label>
            <Input id="primaryPhone" name="primaryPhone" defaultValue={initial?.primaryPhone} />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes (private)</Label>
          <Textarea id="notes" name="notes" defaultValue={initial?.notes} rows={2} />
        </div>

        {state && state.ok && state.message && (
          <p className="text-sm text-[oklch(0.5_0.12_150)]">{state.message}</p>
        )}
        {state && !state.ok && state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <Button type="submit" variant="gold" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {submitLabel}
        </Button>
      </form>
    </Card>
  );
}
