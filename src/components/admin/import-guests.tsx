"use client";

import { useActionState, useRef, useState } from "react";
import { Upload, Loader2, FileText } from "lucide-react";
import { importGuestsCsv, type FormResult } from "@/app/admin/(panel)/guests/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { Card } from "@/components/ui/card";

const TEMPLATE =
  "householdName,invitationCode,primaryContactName,primaryEmail,primaryPhone,maxPartySize,firstName,lastName,relationship,ageGroup,notes\n" +
  "The Adewale Family,,Mr Adewale,adewale@email.com,+2348000000000,3,Tunde,Adewale,Nephew,ADULT,\n" +
  "The Adewale Family,,Mr Adewale,adewale@email.com,+2348000000000,3,Bisi,Adewale,Niece,ADULT,";

export function ImportGuests() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormResult | null, FormData>(importGuestsCsv, null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    if (taRef.current) taRef.current.value = text;
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="size-4" />
        Import CSV
      </Button>
    );
  }

  return (
    <Card className="w-full p-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-serif text-lg">Import guests from CSV</h3>
        <button onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">
          Close
        </button>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        Paste CSV or choose a file. Rows are grouped into households by{" "}
        <code className="rounded bg-surface-muted px-1">householdName</code>. Leave
        <code className="mx-1 rounded bg-surface-muted px-1">invitationCode</code>
        blank to auto-generate one.
      </p>
      <form action={action} className="space-y-3">
        <input type="file" accept=".csv,text/csv" onChange={onFile} className="block text-sm" />
        <Textarea ref={taRef} name="csv" rows={8} placeholder={TEMPLATE} className="font-mono text-xs" />
        {state && (
          <p className={state.ok ? "text-sm text-[oklch(0.5_0.12_150)]" : "text-sm text-destructive"}>
            {state.ok ? state.message : state.error}
          </p>
        )}
        <div className="flex items-center gap-2">
          <Button type="submit" variant="gold" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
            Import
          </Button>
          <button
            type="button"
            className="text-xs text-muted-foreground underline"
            onClick={() => taRef.current && (taRef.current.value = TEMPLATE)}
          >
            Insert sample template
          </button>
        </div>
      </form>
    </Card>
  );
}
