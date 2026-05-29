"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Check, X, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label, Hint } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import {
  lookupHousehold,
  submitRsvp,
  type LookupResult,
} from "@/app/(public)/rsvp/actions";

type Guest = Extract<LookupResult, { ok: true }>["household"]["guests"][number];
type GuestState = {
  rsvpStatus: string;
  mealChoice: string;
  allergies: string;
  accessibility: string;
  notes: string;
};

const MEALS = [
  ["STANDARD", "Standard"],
  ["VEGETARIAN", "Vegetarian"],
  ["VEGAN", "Vegan"],
  ["HALAL", "Halal"],
  ["CHILD", "Child meal"],
] as const;

export function RsvpFlow() {
  const router = useRouter();
  const [lookup, lookupAction, looking] = useActionState<LookupResult | null, FormData>(
    (_p, fd) => lookupHousehold(_p, fd),
    null,
  );

  if (lookup?.ok) {
    return (
      <RespondStep
        household={lookup.household}
        onDone={(s) =>
          router.push(
            `/rsvp/success?a=${s.attending}&d=${s.declined}&t=${s.total}`,
          )
        }
      />
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <form action={lookupAction} className="space-y-5">
        <div>
          <Label htmlFor="invitationCode">Invitation code</Label>
          <Input
            id="invitationCode"
            name="invitationCode"
            placeholder="e.g. JNT-FAM1"
            autoComplete="off"
            autoCapitalize="characters"
          />
          <Hint>Find this on your invitation. It looks like JNT-XXXX.</Hint>
        </div>

        <div className="relative text-center">
          <span className="relative z-10 bg-surface px-3 text-xs uppercase tracking-widest text-muted-foreground">
            or find me by
          </span>
          <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="surname">Surname</Label>
            <Input id="surname" name="surname" placeholder="Olaniru" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@email.com" />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" placeholder="+234…" />
          </div>
        </div>

        {lookup && !lookup.ok && (
          <p role="alert" className="rounded-lg bg-[oklch(0.96_0.03_25)] px-4 py-3 text-sm text-destructive">
            {lookup.error}
          </p>
        )}

        <Button type="submit" variant="gold" size="lg" disabled={looking} className="w-full">
          {looking ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          Find my invitation
        </Button>
      </form>
    </Card>
  );
}

function RespondStep({
  household,
  onDone,
}: {
  household: Extract<LookupResult, { ok: true }>["household"];
  onDone: (s: { attending: number; declined: number; total: number }) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(household.primaryEmail ?? "");
  const [phone, setPhone] = useState(household.primaryPhone ?? "");
  const [message, setMessage] = useState("");

  const [guests, setGuests] = useState<Record<string, GuestState>>(() =>
    Object.fromEntries(
      household.guests.map((g) => [
        g.id,
        {
          rsvpStatus: g.rsvpStatus === "PENDING" ? "" : g.rsvpStatus,
          mealChoice: g.mealChoice ?? "STANDARD",
          allergies: g.allergies ?? "",
          accessibility: g.accessibility ?? "",
          notes: g.notes ?? "",
        },
      ]),
    ),
  );

  const attendingCount = Object.values(guests).filter((g) => g.rsvpStatus === "ATTENDING").length;
  const overCapacity = attendingCount > household.maxPartySize;

  function update(id: string, patch: Partial<GuestState>) {
    setGuests((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function handleSubmit() {
    setFormError(null);
    const responded = household.guests.filter((g) => guests[g.id].rsvpStatus);
    if (!responded.length) {
      setFormError("Please choose a response for at least one guest.");
      return;
    }
    startTransition(async () => {
      const res = await submitRsvp({
        householdId: household.id,
        invitationCode: household.invitationCode,
        submittedByName: name,
        submittedByEmail: email,
        submittedByPhone: phone,
        message,
        guests: responded.map((g) => ({
          guestId: g.id,
          rsvpStatus: guests[g.id].rsvpStatus,
          mealChoice: guests[g.id].mealChoice,
          allergies: guests[g.id].allergies,
          accessibility: guests[g.id].accessibility,
          notes: guests[g.id].notes,
        })),
      });
      if (res.ok) {
        onDone(res.summary);
      } else {
        setFormError(res.error ?? Object.values(res.errors ?? {})[0] ?? "Something went wrong.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <p className="eyebrow">Invitation found</p>
        <h2 className="mt-2 font-serif text-2xl text-foreground">{household.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please respond for each guest below. This invitation welcomes up to{" "}
          <strong>{household.maxPartySize}</strong> attending guest
          {household.maxPartySize === 1 ? "" : "s"}.
        </p>
      </Card>

      <div className="space-y-4">
        {household.guests.map((g) => (
          <GuestCard key={g.id} guest={g} state={guests[g.id]} onChange={(p) => update(g.id, p)} />
        ))}
      </div>

      <Card className="space-y-5 p-6">
        <h3 className="font-serif text-lg">Your details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="byName">Your name *</Label>
            <Input id="byName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <Label htmlFor="byEmail">Email *</Label>
            <Input id="byEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            <Hint>We&apos;ll send your confirmation here.</Hint>
          </div>
        </div>
        <div>
          <Label htmlFor="byPhone">Phone (optional)</Label>
          <Input id="byPhone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234…" />
        </div>
        <div>
          <Label htmlFor="msg">A note for the family (optional)</Label>
          <Textarea id="msg" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="A short message or well-wish — and let us know here if you'd like to join the Aso-Ebi…" maxLength={800} />
          <Hint>Interested in the Aso-Ebi (lace &amp; gele / fabric &amp; fila)? Mention it here and the family will reach out.</Hint>
        </div>
      </Card>

      {overCapacity && (
        <p role="alert" className="rounded-lg bg-[oklch(0.96_0.03_60)] px-4 py-3 text-sm text-foreground">
          You&apos;ve marked {attendingCount} guests attending, but this invitation allows up to{" "}
          {household.maxPartySize}. Please adjust before submitting.
        </p>
      )}
      {formError && (
        <p role="alert" className="rounded-lg bg-[oklch(0.96_0.03_25)] px-4 py-3 text-sm text-destructive">
          {formError}
        </p>
      )}

      <Button onClick={handleSubmit} disabled={pending || overCapacity} variant="gold" size="lg" className="w-full">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        Submit RSVP
      </Button>
    </div>
  );
}

function GuestCard({
  guest,
  state,
  onChange,
}: {
  guest: Guest;
  state: GuestState;
  onChange: (p: Partial<GuestState>) => void;
}) {
  const options = [
    { value: "ATTENDING", label: "Attending", Icon: Check, klass: "text-success" },
    { value: "DECLINED", label: "Can't make it", Icon: X, klass: "text-destructive" },
    { value: "MAYBE", label: "Maybe", Icon: HelpCircle, klass: "text-muted-foreground" },
  ];
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-serif text-lg text-foreground">
            {guest.firstName} {guest.lastName}
          </p>
          {guest.relationship && (
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{guest.relationship}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {options.map((o) => {
            const active = state.rsvpStatus === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onChange({ rsvpStatus: o.value })}
                aria-pressed={active}
                className={
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors " +
                  (active
                    ? "border-gold-strong bg-gold-soft text-foreground"
                    : "border-border text-muted-foreground hover:border-gold")
                }
              >
                <o.Icon className={"size-3.5 " + (active ? o.klass : "")} />
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      {state.rsvpStatus === "ATTENDING" && (
        <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
          <div>
            <Label htmlFor={`meal-${guest.id}`}>Meal preference</Label>
            <Select
              id={`meal-${guest.id}`}
              value={state.mealChoice}
              onChange={(e) => onChange({ mealChoice: e.target.value })}
            >
              {MEALS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor={`allergy-${guest.id}`}>Allergies / dietary needs</Label>
            <Input
              id={`allergy-${guest.id}`}
              value={state.allergies}
              onChange={(e) => onChange({ allergies: e.target.value })}
              placeholder="e.g. nut allergy"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor={`access-${guest.id}`}>Accessibility needs</Label>
            <Input
              id={`access-${guest.id}`}
              value={state.accessibility}
              onChange={(e) => onChange({ accessibility: e.target.value })}
              placeholder="e.g. wheelchair access, seating near front"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
