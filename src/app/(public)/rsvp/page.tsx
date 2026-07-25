import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, CalendarHeart, Clock, MapPin, ArrowDown } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Countdown } from "@/components/countdown";
import { RsvpFlow } from "@/components/rsvp-flow";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { getEvent, getHonoree } from "@/lib/queries";

export const metadata: Metadata = {
  title: "You're Invited · RSVP",
  description: "Your invitation to the 80th birthday celebration of Mrs. Janet E. Olaniru, JP.",
};

// RSVP is dynamic (reads/writes guest data) — never cached.
export const dynamic = "force-dynamic";

export default async function RsvpPage() {
  const [event, honoree] = await Promise.all([getEvent(), getHonoree()]);
  const date = new Date(event.startsAt);

  return (
    <>
      {/* ───────────────────────────── Invitation card ───────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          data-lite-hide="true"
          className="decorative pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_50%_0%,var(--color-gold-soft)_0%,transparent_65%)]"
        />
        <div className="container-narrow py-14 sm:py-20">
          <Reveal className="text-center">
            <p className="eyebrow">You Are Warmly Invited</p>

            {/* Portrait medallion */}
            <div className="mx-auto mt-7 w-fit">
              <div className="relative">
                <div
                  className="decorative absolute -inset-2 rounded-full bg-gold-soft/70 blur-xl"
                  aria-hidden
                  data-lite-hide="true"
                />
                <div className="relative size-36 overflow-hidden rounded-full border-2 border-gold/50 shadow-lg sm:size-44">
                  <Image
                    src={honoree.portrait}
                    alt={`Portrait of ${honoree.fullName}`}
                    fill
                    priority
                    sizes="176px"
                    className="object-cover object-top"
                  />
                </div>
              </div>
            </div>

            <p className="mt-6 font-serif text-sm uppercase tracking-[0.25em] text-gold-strong">
              to celebrate
            </p>
            <h1 className="display mt-3 text-4xl text-foreground sm:text-6xl">
              {honoree.fullName}
            </h1>
            <p className="mt-2 font-serif text-lg italic text-muted-foreground">
              {honoree.honorific ? `${honoree.honorific} · ` : ""}Eighty Years of Grace, Faith &amp; Legacy
            </p>

            <div className="rule-gold mx-auto my-7" />

            {/* Key facts */}
            <dl className="mx-auto grid max-w-xl gap-5 text-left sm:grid-cols-3 sm:text-center">
              <Fact Icon={CalendarHeart} label="Date" value={formatDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} />
              <Fact Icon={Clock} label="Time" value="1:00 pm (WAT)" />
              <Fact Icon={MapPin} label="Venue" value={`${event.venueName} · ${event.city}`} />
            </dl>

            <p className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft/50 px-4 py-1.5 text-sm text-foreground">
              Attire: Aso-Ebi, or white &amp; gold
            </p>

            {/* Countdown */}
            <div className="mt-9">
              <p className="eyebrow mb-3">Counting down to the day</p>
              <Countdown target={event.startsAt} />
            </div>

            <div className="mt-9">
              <Button asChild variant="gold" size="lg">
                <Link href="#respond">
                  Respond to your invitation
                  <ArrowDown className="size-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────────── RSVP form ─────────────────────────── */}
      <section
        id="respond"
        className="scroll-mt-20 border-t border-border bg-surface-muted/40 py-14 sm:py-20"
      >
        <div className="container-narrow">
          <Reveal className="mb-8 text-center">
            <p className="eyebrow">Kindly Respond</p>
            <h2 className="display mt-3 text-3xl text-foreground sm:text-4xl">
              Will you join us?
            </h2>
            <div className="rule-gold mx-auto mt-5" />
            <p className="mx-auto mt-5 max-w-md text-muted-foreground">
              Fill in your details below, and let us know if you&apos;re bringing
              anyone. A phone number is all we need.
            </p>
          </Reveal>

          <RsvpFlow />

          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-gold-strong" />
            Your details are used only for this celebration.
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy notice
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

function Fact({
  Icon,
  label,
  value,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 sm:flex-col sm:items-center sm:gap-1.5">
      <Icon className="mt-0.5 size-5 shrink-0 text-gold-strong sm:mt-0" aria-hidden />
      <div>
        <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
      </div>
    </div>
  );
}
