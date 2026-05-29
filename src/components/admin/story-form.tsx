"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import type { FormResult } from "@/app/admin/(panel)/story/actions";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, FieldError, Hint } from "@/components/ui/field";
import { Card } from "@/components/ui/card";

export type ChapterValues = {
  title?: string;
  slug?: string;
  years?: string;
  quote?: string;
  body?: string;
  image?: string;
  published?: boolean;
};

export function StoryForm({
  action,
  initial,
  submitLabel = "Save chapter",
}: {
  action: (prev: FormResult | null, formData: FormData) => Promise<FormResult>;
  initial?: ChapterValues;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<FormResult | null, FormData>(action, null);
  const e = state && !state.ok ? state.errors : undefined;

  return (
    <Card className="p-6">
      <form action={formAction} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" defaultValue={initial?.title} required aria-invalid={!!e?.title} />
            <FieldError>{e?.title}</FieldError>
          </div>
          <div>
            <Label htmlFor="years">Years</Label>
            <Input id="years" name="years" defaultValue={initial?.years} placeholder="e.g. 1946 – 1964" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={initial?.slug} placeholder="auto from title" aria-invalid={!!e?.slug} />
            <FieldError>{e?.slug}</FieldError>
          </div>
          <div>
            <Label htmlFor="image">Image path / URL</Label>
            <Input id="image" name="image" defaultValue={initial?.image} placeholder="/images/…" />
            <Hint>Leave blank for no image.</Hint>
          </div>
        </div>

        <div>
          <Label htmlFor="quote">Pull-quote (optional)</Label>
          <Input id="quote" name="quote" defaultValue={initial?.quote} />
        </div>

        <div>
          <Label htmlFor="body">Body *</Label>
          <Textarea id="body" name="body" defaultValue={initial?.body} rows={10} required aria-invalid={!!e?.body} />
          <FieldError>{e?.body}</FieldError>
          <Hint>Separate paragraphs with a blank line.</Hint>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={initial?.published ?? true} className="accent-[var(--color-gold-strong)]" />
          Published (visible on the public site)
        </label>

        {state?.ok && state.message && <p className="text-sm text-[oklch(0.5_0.12_150)]">{state.message}</p>}

        <Button type="submit" variant="gold" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {submitLabel}
        </Button>
      </form>
    </Card>
  );
}
