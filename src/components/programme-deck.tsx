"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProgrammeItem = {
  time: string;
  title: string;
  detail?: string;
  duration: string;
  accent?: boolean;
};

export type Movement = {
  numeral: string;
  name: string;
  range: string;
  items: ProgrammeItem[];
};

type Cover = {
  welcome: string;
  intro: string;
  name: string;
  honorific?: string;
  ageLabel: string;
  dateLabel: string;
  timeLabel: string;
  venue: string;
  portrait: string;
};

// Maroon & gold invitation palette.
const GOLD = "#E7C878";
const CREAM = "#F7ECD8";
const MAROON_BG =
  "linear-gradient(165deg, #94202a 0%, #841b23 45%, #6f151c 100%)";

/** A small gold diamond used to separate programme items (no confetti). */
function Diamond() {
  return (
    <div className="flex justify-center py-1" aria-hidden>
      <span
        className="block size-2 rotate-45 rounded-[1px]"
        style={{ backgroundColor: GOLD }}
      />
    </div>
  );
}

/** Faint damask texture + a thin inset gold frame, shared by every slide. */
function SlideDressing() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 bg-[url('/damask.svg')] bg-repeat"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-3 rounded-[18px] border sm:inset-5"
        style={{ borderColor: "rgba(231,200,120,0.35)" }}
        aria-hidden
      />
    </>
  );
}

export function ProgrammeDeck({
  cover,
  movements,
  epigraph,
}: {
  cover: Cover;
  movements: Movement[];
  epigraph: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const total = movements.length + 2; // cover + movements + closing
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (i: number) => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const clamped = Math.max(0, Math.min(total - 1, i));
      const slide = scroller.children[clamped] as HTMLElement | undefined;
      slide?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    },
    [total],
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const i = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(i)) setIndex(i);
          }
        }
      },
      { root: scroller, threshold: 0.6 },
    );
    for (const child of Array.from(scroller.children)) io.observe(child);
    return () => io.disconnect();
  }, [total]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  return (
    <div className="relative" style={{ background: MAROON_BG }}>
      <div
        ref={scrollerRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-roledescription="carousel"
        aria-label="Programme — swipe to move between sections"
        className="flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth outline-none [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* ── Cover ───────────────────────────────────────────── */}
        <section
          data-index={0}
          aria-label="Welcome"
          className="relative flex w-full shrink-0 snap-start overflow-hidden"
          style={{ background: MAROON_BG }}
        >
          <SlideDressing />
          <div className="relative mx-auto flex min-h-[84svh] w-full max-w-lg flex-col items-center justify-center px-6 py-12 text-center">
            <p
              className="font-script text-6xl leading-none sm:text-7xl"
              style={{ color: GOLD }}
            >
              {cover.welcome}
            </p>
            <p
              className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] sm:text-sm"
              style={{ color: CREAM }}
            >
              {cover.intro}
            </p>
            <p
              className="mt-2 font-script text-4xl leading-tight sm:text-6xl"
              style={{ color: GOLD }}
            >
              {cover.name}
            </p>

            {/* Oval portrait */}
            <div
              className="relative mt-7 aspect-[3/4] w-[64%] max-w-[280px] overflow-hidden rounded-[50%] shadow-2xl"
              style={{ border: `4px solid ${GOLD}` }}
            >
              <Image
                src={cover.portrait}
                alt={`Portrait of ${cover.name}`}
                fill
                priority
                unoptimized
                sizes="(max-width: 640px) 64vw, 280px"
                className="object-cover object-[center_22%]"
              />
            </div>

            <p
              className="mt-7 font-serif text-6xl font-bold sm:text-7xl"
              style={{
                background: "linear-gradient(180deg,#F6DDA0 0%,#E7C878 45%,#B8862F 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {cover.ageLabel}
            </p>
            <p
              className="mt-3 text-sm font-semibold uppercase tracking-[0.22em] sm:text-base"
              style={{ color: CREAM }}
            >
              {cover.dateLabel}
            </p>
            <p className="text-sm sm:text-base" style={{ color: "rgba(247,236,216,0.82)" }}>
              {cover.timeLabel} · {cover.venue}
            </p>

            <p
              className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: "rgba(247,236,216,0.7)" }}
            >
              Swipe to begin
              <ChevronRight className="size-4" />
            </p>
          </div>
        </section>

        {/* ── Programme (one movement per slide) ──────────────── */}
        {movements.map((m, mi) => (
          <section
            key={m.numeral}
            data-index={mi + 1}
            aria-label={`Order of Programme — ${m.name}`}
            className="relative flex w-full shrink-0 snap-start overflow-hidden"
            style={{ background: MAROON_BG }}
          >
            <SlideDressing />
            <div className="relative mx-auto flex min-h-[84svh] w-full max-w-lg flex-col px-7 py-12 sm:px-10 sm:py-14">
              <div className="text-center">
                <p
                  className="font-script text-4xl sm:text-5xl"
                  style={{ color: CREAM }}
                >
                  Order of Programme
                </p>
                <p
                  className="mt-3 text-xs font-bold uppercase tracking-[0.22em] sm:text-sm"
                  style={{ color: GOLD }}
                >
                  {m.name} · {m.range}
                </p>
              </div>

              <div className="mt-8 flex-1 space-y-5">
                {m.items.map((item, ii) => (
                  <div key={item.time + item.title}>
                    <div className="text-center">
                      <p
                        className="text-[0.78rem] font-bold uppercase tracking-[0.14em] sm:text-sm"
                        style={{ color: GOLD }}
                      >
                        {item.time}
                      </p>
                      <h3
                        className="mt-1 font-sans text-xl font-bold uppercase leading-snug tracking-wide sm:text-2xl"
                        style={{ color: item.accent ? GOLD : CREAM }}
                      >
                        {item.title}
                      </h3>
                      {item.detail && (
                        <p
                          className="mx-auto mt-1.5 max-w-sm text-base italic leading-relaxed sm:text-lg"
                          style={{ color: "rgba(247,236,216,0.85)" }}
                        >
                          {item.detail}
                        </p>
                      )}
                    </div>
                    {ii < m.items.length - 1 && <Diamond />}
                  </div>
                ))}
              </div>

              <p
                className="mt-8 text-center font-script text-3xl"
                style={{ color: GOLD }}
              >
                {mi + 1} / {movements.length}
              </p>
            </div>
          </section>
        ))}

        {/* ── Closing ─────────────────────────────────────────── */}
        <section
          data-index={total - 1}
          aria-label="Thank you"
          className="relative flex w-full shrink-0 snap-start overflow-hidden"
          style={{ background: MAROON_BG }}
        >
          <SlideDressing />
          <div className="relative mx-auto flex min-h-[84svh] w-full max-w-md flex-col items-center justify-center px-6 py-12 text-center">
            <p className="font-script text-5xl" style={{ color: GOLD }}>
              Thank You
            </p>
            <p
              className="mt-4 max-w-md text-lg italic leading-relaxed"
              style={{ color: CREAM }}
            >
              “{epigraph}”
            </p>

            {/* QR card */}
            <div
              className="mt-9 w-full rounded-3xl p-6 shadow-xl sm:p-7"
              style={{ backgroundColor: CREAM }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a1c22]">
                Share the Programme
              </p>
              <div className="mx-auto mt-4 w-fit rounded-2xl border border-[#e4d6b8] bg-white p-4 shadow-sm">
                <Image
                  src="/programme-qr.svg"
                  alt="QR code linking to this programme"
                  width={150}
                  height={150}
                  unoptimized
                />
              </div>
              <h2 className="mt-4 font-serif text-2xl font-bold text-[#5f0f14]">
                Scan to open on any phone
              </h2>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  href="/programme/qr"
                  className="inline-flex items-center gap-2 rounded-full bg-[#8a1c22] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                >
                  <Maximize2 className="size-4" />
                  Full-screen code
                </Link>
                <a
                  href="/programme-qr.png"
                  download
                  className="inline-flex items-center gap-2 rounded-full border border-[#8a1c22]/40 px-5 py-2.5 text-sm font-semibold text-[#8a1c22] transition hover:bg-[#8a1c22]/5"
                >
                  <Download className="size-4" />
                  Download
                </a>
              </div>
            </div>

            <Link
              href="/rsvp"
              className="mt-6 inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-bold text-[#5f0f14] shadow-lg transition hover:brightness-105"
              style={{
                background: "linear-gradient(180deg,#F6DDA0 0%,#E7C878 50%,#C9A24B 100%)",
              }}
            >
              RSVP to the Celebration
            </Link>
          </div>
        </section>
      </div>

      {/* Desktop arrows */}
      <button
        type="button"
        onClick={() => goTo(index - 1)}
        disabled={index === 0}
        aria-label="Previous section"
        className="absolute left-3 top-1/2 z-20 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full text-[#5f0f14] shadow-lg transition hover:brightness-105 disabled:pointer-events-none disabled:opacity-0 sm:flex"
        style={{ backgroundColor: GOLD }}
      >
        <ChevronLeft className="size-6" />
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        disabled={index === total - 1}
        aria-label="Next section"
        className="absolute right-3 top-1/2 z-20 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full text-[#5f0f14] shadow-lg transition hover:brightness-105 disabled:pointer-events-none disabled:opacity-0 sm:flex"
        style={{ backgroundColor: GOLD }}
      >
        <ChevronRight className="size-6" />
      </button>

      {/* Progress dots */}
      <div className="relative flex items-center justify-center gap-2 py-5">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to section ${i + 1} of ${total}`}
            aria-current={i === index}
            className={cn("h-2.5 rounded-full transition-all")}
            style={{
              width: i === index ? "1.75rem" : "0.625rem",
              backgroundColor: i === index ? GOLD : "rgba(231,200,120,0.35)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
