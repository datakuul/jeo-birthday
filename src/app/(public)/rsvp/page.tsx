import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { RsvpFlow } from "@/components/rsvp-flow";
import { formatDate } from "@/lib/utils";
import { getEvent } from "@/lib/queries";

export const metadata: Metadata = {
  title: "RSVP",
  description: "Respond to the invitation for the 80th birthday celebration.",
};

// RSVP is dynamic (reads/writes guest data) — never cached.
export const dynamic = "force-dynamic";

export default async function RsvpPage() {
  const event = await getEvent();
  return (
    <div className="section">
      <div className="container-narrow">
        <Reveal className="text-center">
          <p className="eyebrow">Kindly Respond</p>
          <h1 className="display mt-4 text-4xl text-foreground sm:text-5xl">RSVP</h1>
          <div className="rule-gold mx-auto mt-6" />
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            We would be honoured by your presence on {formatDate(event.startsAt)} at{" "}
            {event.venueName}, {event.city}. Please find your invitation below and
            let us know if you can join us.
          </p>
        </Reveal>

        <div className="mt-10">
          <RsvpFlow />
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-gold-strong" />
          Your details are used only for this celebration.{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacy notice
          </Link>
        </p>
      </div>
    </div>
  );
}
