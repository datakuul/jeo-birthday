import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarHeart,
  Clock,
  MapPin,
  Shirt,
  Car,
  Accessibility,
  Gift,
  ExternalLink,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getEvent } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Celebration",
  description: "Event details for the 80th birthday celebration.",
};

export default async function EventPage() {
  const event = await getEvent();
  const date = new Date(event.startsAt);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    event.mapQuery || `${event.venueName} ${event.addressLine} ${event.city}`,
  )}`;

  const details = [
    { Icon: Shirt, title: "Dress Code", body: event.dressCode },
    { Icon: Car, title: "Parking", body: event.parking },
    { Icon: Accessibility, title: "Accessibility", body: event.accessibility },
    { Icon: Gift, title: "A Note on Gifts", body: event.giftNote },
  ].filter((d) => d.body);

  return (
    <div className="section">
      <div className="container-prose">
        <header className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="eyebrow">You Are Warmly Invited</p>
            <h1 className="display mt-4 text-4xl text-foreground sm:text-5xl">
              {event.title}
            </h1>
            <div className="rule-gold mx-auto mt-6" />
          </Reveal>
        </header>

        {/* Key facts */}
        <Reveal className="mx-auto mt-12 max-w-2xl">
          <Card className="overflow-hidden">
            <div className="grid sm:grid-cols-2">
              <Fact Icon={CalendarHeart} label="Date" value={formatDate(date)} />
              <Fact Icon={Clock} label="Time" value="1:00 pm (WAT)" />
              <Fact Icon={MapPin} label="Venue" value={event.venueName} />
              <Fact
                Icon={MapPin}
                label="Address"
                value={`${event.addressLine}, ${event.city}`}
              />
            </div>
          </Card>
        </Reveal>

        {/* Map link (no embed — keeps the page light on mobile data) */}
        <Reveal className="mx-auto mt-6 max-w-2xl">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gold/50 bg-gold-soft/30 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="font-medium text-foreground">Getting there</p>
              <p className="text-sm text-muted-foreground">
                Tap for directions to {event.venueName}.
              </p>
            </div>
            <Button asChild variant="gold">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <MapPin className="size-4" />
                Open in Maps
              </a>
            </Button>
          </div>
        </Reveal>

        {/* Details grid */}
        <div className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
          {details.map((d, i) => (
            <Reveal key={d.title} delay={i * 0.06}>
              <Card className="h-full p-6">
                <d.Icon className="size-6 text-gold-strong" aria-hidden />
                <h2 className="mt-3 font-serif text-lg text-foreground">{d.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {d.body}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>

        {event.venueWebsite && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            More about the venue:{" "}
            <a
              href={event.venueWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-gold-strong underline underline-offset-2"
            >
              {event.venueWebsite.replace(/^https?:\/\//, "")}
              <ExternalLink className="size-3" />
            </a>
          </p>
        )}

        <Reveal className="mx-auto mt-14 max-w-2xl rounded-2xl bg-ink p-8 text-center text-ink-foreground sm:p-10">
          <h2 className="display text-2xl sm:text-3xl">Will you join us?</h2>
          <p className="mx-auto mt-3 max-w-md text-ink-foreground/80">
            Kindly respond so we can prepare a place for you.
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
    <div className="flex items-start gap-3 border-b border-border p-5 last:border-b-0 sm:[&:nth-child(odd)]:border-r">
      <Icon className="mt-0.5 size-5 shrink-0 text-gold-strong" aria-hidden />
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-0.5 font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
