import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: Date | string,
  opts: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  },
) {
  // Pin to West Africa Time so server (UTC on Vercel) and client (any timezone)
  // always render identical text — no hydration mismatch — and it reflects the
  // real local time of the celebration in Nigeria.
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    ...opts,
  }).format(new Date(date));
}

/** Build initials from a name, e.g. "Janet E. Olaniru" -> "JEO" */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
