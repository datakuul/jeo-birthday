import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Quote } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { getHonoree, getStoryChapters } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Her Story",
  description:
    "The life story of Mrs. Janet E. Olaniru — educator, mother, entrepreneur and devoted servant of God.",
};

export default async function StoryPage() {
  const [honoree, chapters] = await Promise.all([
    getHonoree(),
    getStoryChapters(),
  ]);

  return (
    <>
      <header className="section pb-8">
        <div className="container-narrow text-center">
          <Reveal>
            <p className="eyebrow">Eighty Years of Grace</p>
            <h1 className="display mt-4 text-4xl text-foreground sm:text-5xl">
              The Story of {honoree.fullName}
            </h1>
            <div className="rule-gold mx-auto mt-6" />
            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {honoree.intro}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Born in {honoree.birthPlace}.
            </p>
          </Reveal>
        </div>
      </header>

      <div className="container-prose pb-24">
        <ol className="relative mx-auto max-w-3xl">
          {/* vertical timeline rule */}
          <span
            className="decorative absolute left-4 top-2 bottom-2 hidden w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent sm:block"
            aria-hidden
          />
          {chapters.map((c, i) => (
            <li key={c.slug} id={c.slug} className="relative scroll-mt-24">
              <Reveal as="article" className="py-10 sm:pl-16">
                <span
                  className="decorative absolute left-2.5 top-12 hidden size-3 rounded-full border-2 border-gold-strong bg-[var(--color-background)] sm:block"
                  aria-hidden
                />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-strong">
                  {c.years}
                </p>
                <h2 className="display mt-2 text-2xl text-foreground sm:text-3xl">
                  {c.title}
                </h2>

                {c.image ? (
                  <div className="relative my-6 aspect-[16/10] overflow-hidden rounded-xl border border-border shadow-sm">
                    <Image
                      src={c.image}
                      alt={c.title}
                      fill
                      sizes="(max-width: 768px) 90vw, 700px"
                      loading={i === 0 ? "eager" : "lazy"}
                      className="object-cover"
                    />
                  </div>
                ) : null}

                <div className="prose-warm mt-5 text-[1.02rem]">
                  {c.body.split("\n").filter(Boolean).map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                {c.quote ? (
                  <blockquote className="mt-6 flex gap-3 border-l-2 border-gold pl-5">
                    <Quote
                      className="mt-1 size-4 shrink-0 text-gold-strong/60"
                      aria-hidden
                    />
                    <p className="font-serif text-lg italic leading-relaxed text-foreground/90">
                      {c.quote}
                    </p>
                  </blockquote>
                ) : null}
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className="mx-auto mt-8 max-w-3xl rounded-2xl border border-gold/30 bg-gold-soft/40 p-8 text-center sm:p-10">
          <h2 className="display text-2xl text-foreground sm:text-3xl">
            Celebrate this story with us
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Join the family in honouring eighty years of faith, service and love.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold">
              <Link href="/rsvp">RSVP to the Celebration</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/tributes">Leave a tribute</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </>
  );
}
