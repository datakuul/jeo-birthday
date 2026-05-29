"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Send, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { submitTribute, type TributeResult } from "@/app/(public)/tributes/actions";

export function TributeForm() {
  const [state, action, pending] = useActionState<TributeResult | null, FormData>(
    submitTribute,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  if (state?.ok) {
    return (
      <Card className="p-8 text-center">
        <Heart className="mx-auto size-10 text-gold-strong" aria-hidden />
        <h3 className="mt-4 font-serif text-xl text-foreground">Thank you</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your tribute has been received and will appear here once the family has
          had a chance to review it.
        </p>
        <Button
          variant="outline"
          className="mt-5"
          onClick={() => location.reload()}
        >
          Write another
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <form ref={formRef} action={action} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="author">Your name *</Label>
            <Input id="author" name="author" required maxLength={120} aria-invalid={!!state?.errors?.author} />
            <FieldError>{state?.errors?.author}</FieldError>
          </div>
          <div>
            <Label htmlFor="relationship">Relationship (optional)</Label>
            <Input id="relationship" name="relationship" placeholder="e.g. Former student, Niece" maxLength={120} />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email (optional, never shown)</Label>
          <Input id="email" name="email" type="email" placeholder="you@email.com" />
        </div>

        <div>
          <Label htmlFor="message">Your tribute *</Label>
          <Textarea
            id="message"
            name="message"
            required
            rows={5}
            maxLength={1200}
            placeholder="Share a memory, a thank-you, or a blessing for Mrs. Olaniru…"
            aria-invalid={!!state?.errors?.message}
          />
          <FieldError>{state?.errors?.message}</FieldError>
        </div>

        {/* Honeypot — hidden from people, tempting to bots */}
        <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        {state && !state.ok && state.error && (
          <p role="alert" className="text-sm text-destructive">{state.error}</p>
        )}

        <Button type="submit" variant="gold" size="lg" disabled={pending} className="w-full">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Share your tribute
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Tributes are reviewed by the family before appearing publicly.
        </p>
      </form>
    </Card>
  );
}
