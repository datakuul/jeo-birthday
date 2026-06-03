import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, CalendarHeart, Mail } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getEvent } from "@/lib/queries";

export const metadata: Metadata = {
  title: "RSVP Received",
  robots: { index: false, follow: false },
};

export default async function RsvpSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; d?: string; t?: string }>;
}) {
  const sp = await searchParams;
  const event = await getEvent();
  const attending = Number(sp.a ?? 0);
  const declined = Number(sp.d ?? 0);
  const hostEmail = process.env.HOST_CONTACT_EMAIL ?? "";

  return (
    <div className="section">
      <div className="container-narrow text-center">
        <Reveal>
          <CheckCircle2 className="mx-auto size-14 text-gold-strong" aria-hidden />
          <p className="eyebrow mt-6">Thank You</p>
          <h1 className="display mt-3 text-4xl text-foreground sm:text-5xl">
            Your RSVP is in
          </h1>
          <div className="rule-gold mx-auto mt-6" />
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            {attending > 0
              ? `We're delighted — ${attending} ${attending === 1 ? "guest" : "guests"} attending. If you left an email, a confirmation is on its way.`
              : "Thank you for letting us know. You'll be missed, and we're grateful you responded."}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="mx-auto mt-10 max-w-md p-6 text-left">
            <div className="space-y-4">
              {attending > 0 && (
                <Row label="Attending" value={`${attending} guest${attending === 1 ? "" : "s"}`} />
              )}
              {declined > 0 && (
                <Row label="Unable to attend" value={`${declined} guest${declined === 1 ? "" : "s"}`} />
              )}
              <div className="flex items-start gap-3 border-t border-border pt-4">
                <CalendarHeart className="mt-0.5 size-5 shrink-0 text-gold-strong" />
                <div>
                  <p className="font-medium text-foreground">{formatDate(event.startsAt)}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.venueName}, {event.city}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </Reveal>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="gold">
            <Link href="/event">View event details</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/tributes">Leave a tribute</Link>
          </Button>
          {hostEmail && (
            <Button asChild variant="ghost">
              <a href={`mailto:${hostEmail}?subject=RSVP%20enquiry`}>
                <Mail className="size-4" />
                Contact the host
              </a>
            </Button>
          )}
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Need to change your response?{" "}
          <Link href="/rsvp" className="underline underline-offset-2 hover:text-foreground">
            Look up your invitation again
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
