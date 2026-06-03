import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarHeart, MapPin, Quote, PartyPopper } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Countdown } from "@/components/countdown";
import { SectionHeading } from "@/components/section-heading";
import { GalleryThumb } from "@/components/gallery-thumb";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  getHonoree,
  getStoryChapters,
  getEvent,
  getGalleryAlbums,
} from "@/lib/queries";

// Static-first: rebuild periodically, never block on the DB at request time.
export const revalidate = 3600;

export default async function HomePage() {
  const [honoree, chapters, event, albums] = await Promise.all([
    getHonoree(),
    getStoryChapters(),
    getEvent(),
    getGalleryAlbums(),
  ]);

  const featuredChapters = chapters.slice(0, 3);
  const featuredImages = albums.flatMap((a) => a.images).slice(0, 4);
  const eventDate = new Date(event.startsAt);

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        {/* Festive warm glow + scattered gold sparkles (hidden in Lite Mode) */}
        <div
          aria-hidden
          data-lite-hide="true"
          className="decorative pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_75%_15%,var(--color-gold-soft)_0%,transparent_60%),radial-gradient(45%_40%_at_10%_10%,oklch(0.95_0.04_60)_0%,transparent_55%)]"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-12 pt-10 md:grid-cols-2 md:gap-14 md:pb-20 md:pt-14">
          <Reveal className="order-2 md:order-1">
            <p className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold-soft/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-strong">
              <PartyPopper className="size-3.5" />
              Happy 80th Birthday
            </p>

            <h1 className="mt-5 font-serif text-foreground">
              <span className="block text-[3.4rem] font-medium leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
                Janet
              </span>
              <span className="mt-1 flex items-baseline gap-3 text-[3.4rem] font-medium leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
                <span className="font-light italic text-muted-foreground/70">at</span>
                <span className="bg-gradient-to-br from-gold via-gold-strong to-gold bg-clip-text text-transparent">
                  80
                </span>
              </span>
            </h1>

            <p className="mt-5 max-w-md font-serif text-xl italic leading-snug text-gold-strong sm:text-2xl">
              Celebrating the life, faith &amp; legacy of {honoree.fullName}
              {honoree.honorific ? `, ${honoree.honorific}` : ""}
            </p>

            <div className="rule-gold mt-6" />

            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              {honoree.intro}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-foreground">
              <span className="inline-flex items-center gap-2">
                <CalendarHeart className="size-4 text-gold-strong" />
                {formatDate(eventDate)}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-gold-strong" />
                {event.city}
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="gold">
                <Link href="/rsvp">
                  RSVP to the Celebration
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/story">Read Her Story</Link>
              </Button>
            </div>
          </Reveal>

          {/* Single optimized hero portrait (the only priority image on the page) */}
          <Reveal className="order-1 md:order-2">
            <div className="relative mx-auto max-w-sm md:max-w-none">
              <div
                className="decorative absolute -inset-3 -z-10 rounded-[2rem] bg-gold-soft/60 blur-2xl"
                aria-hidden
                data-lite-hide="true"
              />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-border shadow-xl">
                <Image
                  src={honoree.heroImage}
                  alt={`Portrait of ${honoree.fullName}`}
                  fill
                  priority
                  sizes="(max-width: 768px) 90vw, 45vw"
                  className="-scale-x-100 object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold-strong px-6 py-2 shadow-lg">
                <span className="font-serif text-sm tracking-wide text-white">
                  Eighty &amp; Radiant
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Countdown band */}
        <div className="border-y border-border bg-surface-muted/60">
          <div className="mx-auto max-w-6xl px-5 py-8 text-center">
            <p className="eyebrow mb-4">Counting Down to the Day</p>
            <Countdown target={event.startsAt} />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- Featured story */}
      <section className="section">
        <div className="container-prose">
          <SectionHeading
            eyebrow="A Life Beautifully Lived"
            title="Moments from Her Journey"
            intro="From a village in Yagba-West (now part of Kogi State) to a lifetime of teaching, enterprise, faith, and family — a few chapters from a remarkable story."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {featuredChapters.map((c, i) => (
              <Reveal key={c.slug} delay={i * 0.08} as="article">
                <Link
                  href={`/story#${c.slug}`}
                  className="group block h-full overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[3/2] overflow-hidden bg-surface-muted">
                    {c.image ? (
                      <Image
                        src={c.image}
                        alt={c.title}
                        fill
                        sizes="(max-width: 640px) 90vw, 30vw"
                        loading="lazy"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-widest text-gold-strong">
                      {c.years}
                    </p>
                    <h3 className="mt-2 font-serif text-xl text-foreground">
                      {c.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {c.body.split("\n")[0]}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-gold-strong">
                      Continue reading
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button asChild variant="outline">
              <Link href="/story">
                Read the full life story
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- Quote */}
      <section className="bg-ink py-20 text-ink-foreground">
        <div className="container-narrow text-center">
          <Reveal>
            <Quote className="mx-auto size-8 text-gold/70" aria-hidden />
            <blockquote className="mt-6 font-serif text-2xl italic leading-relaxed sm:text-3xl">
              “{honoree.epigraph}”
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------- Featured gallery */}
      <section className="section">
        <div className="container-prose">
          <SectionHeading
            eyebrow="Through the Years"
            title="A Glimpse of the Album"
            intro="A few cherished frames. Open the full gallery to wander through the years — photographs are added by the family with care."
          />
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {featuredImages.map((img) => (
              <GalleryThumb key={img.id} image={img} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline">
              <Link href="/gallery">
                Open the gallery
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- Event preview */}
      <section className="border-t border-border bg-surface-muted/50 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2">
          <Reveal>
            <p className="eyebrow">You Are Warmly Invited</p>
            <h2 className="display mt-3 text-3xl text-foreground sm:text-4xl">
              The 80th Birthday Celebration
            </h2>
            <dl className="mt-8 space-y-5 text-foreground">
              <div className="flex gap-3">
                <CalendarHeart className="mt-0.5 size-5 shrink-0 text-gold-strong" />
                <div>
                  <dt className="font-medium">{formatDate(eventDate)}</dt>
                  <dd className="text-sm text-muted-foreground">
                    {formatDate(eventDate, { hour: "numeric", minute: "2-digit" })}{" "}
                    (West Africa Time)
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-gold-strong" />
                <div>
                  <dt className="font-medium">{event.venueName}</dt>
                  <dd className="text-sm text-muted-foreground">
                    {event.addressLine}, {event.city}
                  </dd>
                </div>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold">
                <Link href="/rsvp">RSVP Now</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/event">Event details</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border shadow-lg">
              <Image
                src="/images/honoree-smile-colour.jpg"
                alt={`${honoree.fullName} smiling`}
                fill
                sizes="(max-width: 768px) 90vw, 45vw"
                loading="lazy"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
