"use client";

import { useActionState, useRef, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { createTable, type FormResult } from "@/app/admin/(panel)/seating/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export function TableForm() {
  const [state, action, pending] = useActionState<FormResult | null, FormData>(createTable, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="flex flex-wrap items-end gap-3">
      <div>
        <Label htmlFor="name">Table name</Label>
        <Input id="name" name="name" placeholder="e.g. Table 5 — Friends" className="w-56" required />
      </div>
      <div>
        <Label htmlFor="capacity">Seats</Label>
        <Input id="capacity" name="capacity" type="number" min={1} max={40} defaultValue={10} className="w-24" />
      </div>
      <Button type="submit" variant="gold" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Add table
      </Button>
    </form>
  );
}
