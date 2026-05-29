"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const now = Date.now();
  const ms = Math.max(0, target - now);
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { days, hours, minutes, seconds, done: ms === 0 };
}

const labels: Record<string, string> = {
  days: "Days",
  hours: "Hours",
  minutes: "Minutes",
  seconds: "Seconds",
};

export function Countdown({ target }: { target: string }) {
  const targetMs = new Date(target).getTime();
  // Render zeros on the server, hydrate to real values to avoid mismatch.
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- start clock post-hydration
    setT(diff(targetMs));
    const id = setInterval(() => setT(diff(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const view = t ?? { days: 0, hours: 0, minutes: 0, seconds: 0, done: false };

  if (t?.done) {
    return (
      <p className="font-serif text-2xl text-gold-strong">
        Today is the day — welcome, and thank you for celebrating with us.
      </p>
    );
  }

  return (
    <div
      className="flex items-stretch justify-center gap-3 sm:gap-5"
      aria-label="Countdown to the celebration"
    >
      {(["days", "hours", "minutes", "seconds"] as const).map((unit) => (
        <div
          key={unit}
          className="flex min-w-16 flex-col items-center rounded-xl border border-border bg-surface/70 px-3 py-3 backdrop-blur-sm sm:min-w-20 sm:px-4"
        >
          <span
            className="font-serif text-3xl tabular-nums text-foreground sm:text-4xl"
            suppressHydrationWarning
          >
            {String(view[unit]).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground">
            {labels[unit]}
          </span>
        </div>
      ))}
    </div>
  );
}
