"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { honoree } from "@/content/honoree";

const links = [
  { href: "/story", label: "Her Story" },
  { href: "/gallery", label: "Gallery" },
  { href: "/tributes", label: "Tributes" },
  { href: "/event", label: "The Celebration" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close mobile menu on route change
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-[var(--color-background)]/85 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link
          href="/"
          className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-[1.7rem]"
          aria-label={`${honoree.shortName} at 80 — home`}
        >
          {honoree.shortName}
          <span className="px-1 font-light italic text-muted-foreground/70">at</span>
          <span className="bg-gradient-to-br from-gold via-gold-strong to-gold bg-clip-text font-semibold text-transparent">
            80
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "link-underline text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === l.href && "text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/rsvp"
            className="rounded-full bg-gold-strong px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:brightness-105"
          >
            RSVP
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-[var(--color-background)] md:hidden">
          <div className="flex flex-col px-5 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="border-b border-border/60 py-3.5 text-base font-medium text-foreground last:border-0"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/rsvp"
              className="mt-3 rounded-full bg-gold-strong px-5 py-3 text-center text-base font-medium text-white"
            >
              RSVP to the Celebration
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
