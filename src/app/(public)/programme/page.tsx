import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarHeart,
  Clock,
  MapPin,
  Sparkles,
  Download,
  Maximize2,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { formatDate, cn } from "@/lib/utils";
import { event, honoree } from "@/content/honoree";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Programme",
  description:
    "The order of ceremony for the 80th birthday celebration of Mrs. Janet E. Olaniru, JP — Saturday, 25 July 2026 in Ibadan.",
};

type ProgrammeItem = {
  time: string;
  title: string;
  detail?: string;
  duration: string;
  accent?: boolean;
};

type Movement = {
  numeral: string;
  name: string;
  range: string;
  items: ProgrammeItem[];
};

// The order of ceremony, grouped into movements for an unhurried, ceremonial read.
const MOVEMENTS: Movement[] = [
  {
    numeral: "I",
    name: "Arrival & Procession",
    range: "1:00 – 1:45 pm",
    items: [
      {
        time: "1:00 – 1:30 pm",
        title: "Arrival of Guests",
        detail:
          "Red carpet, live instrumental music, and ushers on hand to receive our guests.",
        duration: "30 mins",
      },
      {
        time: "1:30 – 1:40 pm",
        title: "Arrival of the Celebrant & Family",
        duration: "10 mins",
      },
      {
        time: "1:40 – 1:45 pm",
        title: "Processional into the Hall",
        duration: "5 mins",
      },
    ],
  },
  {
    numeral: "II",
    name: "Opening & Welcome",
    range: "1:45 – 2:05 pm",
    items: [
      { time: "1:45 – 1:50 pm", title: "Opening Prayer", duration: "5 mins" },
      {
        time: "1:50 – 1:55 pm",
        title: "Welcome Address by the MC",
        duration: "5 mins",
      },
      {
        time: "1:55 – 2:05 pm",
        title: "Recognition of Special Guests",
        detail: "Traditional rulers, clergy, family and friends.",
        duration: "10 mins",
      },
    ],
  },
  {
    numeral: "III",
    name: "Tributes & Honours",
    range: "2:05 – 3:00 pm",
    items: [
      {
        time: "2:05 – 2:15 pm",
        title: "Biography of Mrs. J. E. Olaniru (JP)",
        duration: "10 mins",
      },
      {
        time: "2:15 – 2:25 pm",
        title: "Tribute Video Presentation",
        duration: "10 mins",
      },
      {
        time: "2:25 – 2:40 pm",
        title: "Family Tributes",
        detail: "Children & grandchildren.",
        duration: "15 mins",
      },
      { time: "2:40 – 2:50 pm", title: "Friends’ Tribute", duration: "10 mins" },
      {
        time: "2:50 – 3:00 pm",
        title: "Toast to the Celebrant",
        duration: "10 mins",
      },
    ],
  },
  {
    numeral: "IV",
    name: "The Celebration",
    range: "3:00 – 3:30 pm",
    items: [
      {
        time: "3:00 – 3:15 pm",
        title: "Cutting of the 80th Birthday Cake",
        duration: "15 mins",
        accent: true,
      },
      {
        time: "3:15 – 3:20 pm",
        title: "Group Photograph",
        duration: "5 mins",
      },
      {
        time: "3:20 – 3:30 pm",
        title: "Ewi Presentation",
        detail: "A Yoruba poetic recital in the celebrant’s honour.",
        duration: "10 mins",
      },
    ],
  },
  {
    numeral: "V",
    name: "Feast & Festivity",
    range: "3:30 – 6:50 pm",
    items: [
      { time: "3:30 – 4:15 pm", title: "Lunch Service", duration: "45 mins" },
      {
        time: "4:15 – 4:25 pm",
        title: "Transition to Entertainment",
        duration: "10 mins",
      },
      {
        time: "4:25 – 6:50 pm",
        title: "Live Performance by Sir Shina Peters",
        detail:
          "A presentation of guests to the band, followed by an open dance floor.",
        duration: "2 hrs 25 mins",
        accent: true,
      },
    ],
  },
  {
    numeral: "VI",
    name: "Farewell",
    range: "6:50 – 7:00 pm",
    items: [
      {
        time: "6:50 – 7:00 pm",
        title: "Closing Prayer & Appreciation",
        detail: "A word of thanks from the family, and the departure of guests.",
        duration: "10 mins",
      },
    ],
  },
];

export default function ProgrammePage() {
  return (
    <div className="section">
      <div className="container-narrow">
        {/* Header */}
        <header className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="eyebrow">Order of Ceremony</p>
            <h1 className="display mt-4 text-4xl text-foreground sm:text-5xl">
              The Programme
            </h1>
            <div className="rule-gold mx-auto mt-6" />
            <p className="mt-6 font-serif text-lg italic text-muted-foreground">
              In loving celebration of {honoree.fullName}, {honoree.honorific}
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-2.5 text-sm text-muted-foreground sm:flex-row sm:gap-4">
              <span className="inline-flex items-center gap-1.5">
                <CalendarHeart className="size-4 text-gold-strong" aria-hidden />
                {formatDate(event.startsAt)}
              </span>
              <span className="hidden text-gold/60 sm:inline">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4 text-gold-strong" aria-hidden />
                1:00 pm (WAT)
              </span>
              <span className="hidden text-gold/60 sm:inline">·</span>
              <span className="inline-flex items-center gap-1.5 text-center">
                <MapPin className="size-4 shrink-0 text-gold-strong" aria-hidden />
                {event.venueName}
              </span>
            </div>
          </Reveal>
        </header>

        {/* Movements */}
        <div className="mx-auto mt-16 max-w-xl space-y-14">
          {MOVEMENTS.map((movement, mi) => (
            <Reveal key={movement.numeral} as="section" delay={mi * 0.04}>
              {/* Movement heading */}
              <div className="mb-7 flex items-center gap-4">
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gold-soft/40 font-serif text-lg text-gold-strong"
                  aria-hidden
                >
                  {movement.numeral}
                </span>
                <div>
                  <h2 className="font-serif text-2xl text-foreground sm:text-[1.7rem]">
                    {movement.name}
                  </h2>
                  <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {movement.range}
                  </p>
                </div>
              </div>

              {/* Timeline of items */}
              <ol className="relative ml-[21px] border-l border-border pl-8">
                {movement.items.map((item, ii) => (
                  <li
                    key={item.time + item.title}
                    className="relative pb-9 last:pb-0"
                  >
                    {/* Node on the rail */}
                    <span
                      className={cn(
                        "absolute -left-[calc(2rem+1px)] top-1.5 -translate-x-1/2 rounded-full ring-4 ring-[var(--color-background)]",
                        item.accent
                          ? "size-3 bg-gold-strong"
                          : "size-2.5 bg-gold/70",
                      )}
                      aria-hidden
                    />

                    <div
                      className={cn(
                        item.accent &&
                          "rounded-xl border border-gold/40 bg-gold-soft/40 p-4",
                      )}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <time className="font-serif text-[0.95rem] font-medium tabular-nums text-gold-strong">
                          {item.time}
                        </time>
                        <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-[0.68rem] font-medium uppercase tracking-wide text-muted-foreground">
                          {item.duration}
                        </span>
                      </div>
                      <h3 className="mt-1.5 flex items-start gap-1.5 font-serif text-lg text-foreground sm:text-xl">
                        {item.accent && (
                          <Sparkles
                            className="mt-1 size-4 shrink-0 text-gold-strong"
                            aria-hidden
                          />
                        )}
                        <span>{item.title}</span>
                      </h3>
                      {item.detail && (
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {item.detail}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          ))}
        </div>

        {/* Closing note */}
        <Reveal className="mx-auto mt-16 max-w-md text-center">
          <div className="rule-gold mx-auto" />
          <p className="mt-6 font-serif text-lg italic leading-relaxed text-muted-foreground">
            “{honoree.epigraph}”
          </p>
        </Reveal>

        {/* Share via QR */}
        <Reveal className="mx-auto mt-14 max-w-2xl">
          <div className="grid gap-6 rounded-2xl border border-border bg-surface p-6 text-center sm:grid-cols-[auto_1fr] sm:items-center sm:p-8 sm:text-left">
            <div className="mx-auto rounded-xl border border-border bg-white p-3 shadow-sm">
              <Image
                src="/programme-qr.svg"
                alt="QR code linking to this programme"
                width={132}
                height={132}
                unoptimized
              />
            </div>
            <div>
              <p className="eyebrow">Share the Programme</p>
              <h2 className="mt-2 font-serif text-xl text-foreground">
                Scan to open on any phone
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Point a phone camera at the code to bring up the full order of
                ceremony. Please feel free to share it with fellow guests.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                <Button asChild variant="gold" size="sm">
                  <Link href="/programme/qr">
                    <Maximize2 className="size-4" />
                    Full-screen code
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="/programme-qr.png" download>
                    <Download className="size-4" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* RSVP CTA */}
        <Reveal className="mx-auto mt-8 max-w-2xl rounded-2xl bg-ink p-8 text-center text-ink-foreground sm:p-10">
          <h2 className="display text-2xl sm:text-3xl">Celebrate with us</h2>
          <p className="mx-auto mt-3 max-w-md text-ink-foreground/80">
            Kindly let us know you’re coming so we can prepare a place for you at
            the table.
          </p>
          <div className="mt-6">
            <Button asChild variant="gold" size="lg">
              <Link href="/rsvp">RSVP to the Celebration</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
