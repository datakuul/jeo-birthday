"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X, HelpCircle, Plus, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label, FieldError, Hint } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { submitOpenRsvp } from "@/app/(public)/rsvp/actions";

const MEALS = [
  ["STANDARD", "Standard"],
  ["VEGETARIAN", "Vegetarian"],
  ["VEGAN", "Vegan"],
  ["HALAL", "Halal"],
] as const;

const STATUS_OPTIONS = [
  { value: "ATTENDING", label: "Joyfully attending", Icon: Check, klass: "text-success" },
  { value: "DECLINED", label: "Sadly can't make it", Icon: X, klass: "text-destructive" },
  { value: "MAYBE", label: "Maybe", Icon: HelpCircle, klass: "text-muted-foreground" },
] as const;

type ExtraGuest = { name: string; mealChoice: string };

export function RsvpFlow() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [status, setStatus] = useState<string>("ATTENDING");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // anti-spam: honeypot + the moment the form was rendered
  const [hp, setHp] = useState("");
  const [renderedAt] = useState(() => Date.now());
  const [mealChoice, setMealChoice] = useState("STANDARD");
  const [allergies, setAllergies] = useState("");
  const [accessibility, setAccessibility] = useState("");
  const [bringingGuests, setBringingGuests] = useState(false);
  const [guests, setGuests] = useState<ExtraGuest[]>([]);
  const [message, setMessage] = useState("");

  const attending = status === "ATTENDING";

  function addGuest() {
    setGuests((g) => [...g, { name: "", mealChoice: "STANDARD" }]);
  }
  function updateGuest(i: number, patch: Partial<ExtraGuest>) {
    setGuests((g) => g.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }
  function removeGuest(i: number) {
    setGuests((g) => g.filter((_, idx) => idx !== i));
  }

  function toggleBringing(v: boolean) {
    setBringingGuests(v);
    if (v && guests.length === 0) addGuest();
    if (!v) setGuests([]);
  }

  function handleSubmit() {
    setErrors({});
    setFormError(null);
    const cleanedGuests =
      attending && bringingGuests ? guests.filter((g) => g.name.trim()) : [];

    startTransition(async () => {
      const res = await submitOpenRsvp({
        rsvpStatus: status,
        fullName,
        email,
        phone,
        mealChoice,
        allergies,
        accessibility,
        bringingGuests: attending && bringingGuests,
        guests: cleanedGuests,
        message,
        website: hp,
        renderedAt,
      });
      if (res.ok) {
        router.push(
          `/rsvp/success?a=${res.summary.attending}&d=${res.summary.declined}&t=${res.summary.total}`,
        );
      } else {
        setErrors(res.errors ?? {});
        setFormError(res.error ?? (res.errors && Object.values(res.errors)[0]) ?? "Something went wrong.");
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Step 1 — will you attend? */}
      <Card className="p-6">
        <Label>Will you join the celebration?</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((o) => {
            const active = status === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => setStatus(o.value)}
                aria-pressed={active}
                className={
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors " +
                  (active
                    ? "border-gold-strong bg-gold-soft text-foreground"
                    : "border-border text-muted-foreground hover:border-gold")
                }
              >
                <o.Icon className={"size-4 " + (active ? o.klass : "")} />
                {o.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Step 2 — your details */}
      <Card className="space-y-5 p-6">
        <h3 className="font-serif text-lg">Your details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="fullName">Full name *</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Tunde Adewale" aria-invalid={!!errors.fullName} />
            <FieldError>{errors.fullName}</FieldError>
          </div>
          <div>
            <Label htmlFor="phone">Phone number *</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234…" aria-invalid={!!errors.phone} />
            <FieldError>{errors.phone}</FieldError>
          </div>
        </div>
        <div className="sm:max-w-md">
          <Label htmlFor="email">Email (optional)</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" aria-invalid={!!errors.email} />
          <FieldError>{errors.email}</FieldError>
          <Hint>If you add it, we&apos;ll send a confirmation here.</Hint>
        </div>

        {/* Honeypot — hidden from people, tempting to bots */}
        <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
        </div>

        {attending && (
          <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="meal">Your meal preference</Label>
              <Select id="meal" value={mealChoice} onChange={(e) => setMealChoice(e.target.value)}>
                {MEALS.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="allergies">Allergies / dietary needs</Label>
              <Input id="allergies" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g. nut allergy" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="access">Accessibility needs</Label>
              <Input id="access" value={accessibility} onChange={(e) => setAccessibility(e.target.value)} placeholder="e.g. wheelchair access, seating near front" />
            </div>
          </div>
        )}
      </Card>

      {/* Step 3 — bringing guests (only when attending) */}
      {attending && (
        <Card className="space-y-4 p-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={bringingGuests}
              onChange={(e) => toggleBringing(e.target.checked)}
              className="size-4 accent-[var(--color-gold-strong)]"
            />
            <span className="font-serif text-lg">I&apos;m bringing guests</span>
          </label>

          {bringingGuests && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Please add each guest&apos;s name. Guests are <strong>adults</strong> —
                for children, kindly contact the host directly.
              </p>
              {guests.map((g, i) => (
                <div key={i} className="flex flex-wrap items-end gap-3 rounded-lg bg-surface-muted/50 p-3">
                  <div className="min-w-0 flex-1">
                    <Label htmlFor={`g-name-${i}`}>Guest {i + 1} name *</Label>
                    <Input
                      id={`g-name-${i}`}
                      value={g.name}
                      onChange={(e) => updateGuest(i, { name: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="w-40">
                    <Label htmlFor={`g-meal-${i}`}>Meal</Label>
                    <Select id={`g-meal-${i}`} value={g.mealChoice} onChange={(e) => updateGuest(i, { mealChoice: e.target.value })}>
                      {MEALS.map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </Select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGuest(i)}
                    className="mb-1 rounded-lg p-2 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove guest ${i + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              <FieldError>{errors.guests}</FieldError>
              <Button type="button" variant="outline" size="sm" onClick={addGuest}>
                <Plus className="size-4" /> Add another guest
              </Button>
              <p className="text-sm font-medium text-foreground">
                Your party: {1 + guests.filter((g) => g.name.trim()).length} attending
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 4 — message */}
      <Card className="p-6">
        <Label htmlFor="msg">A note for the family (optional)</Label>
        <Textarea
          id="msg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="A short message or well-wish — and let us know here if you'd like to join the Aso-Ebi…"
          maxLength={800}
        />
        <Hint>Interested in the Aso-Ebi (lace &amp; gele / fabric &amp; fila)? Mention it here and the family will reach out.</Hint>
      </Card>

      {formError && (
        <p role="alert" className="rounded-lg bg-[oklch(0.96_0.03_25)] px-4 py-3 text-sm text-destructive">
          {formError}
        </p>
      )}

      <Button onClick={handleSubmit} disabled={pending} variant="gold" size="lg" className="w-full">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        Send my RSVP
      </Button>
    </div>
  );
}
