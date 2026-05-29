import Link from "next/link";
import { honoree, event } from "@/content/honoree";
import { LiteModeToggle } from "@/components/lite-mode";
import { formatDate } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-muted">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-serif text-2xl text-foreground">
              {honoree.shortName}
              <span className="px-1 font-light italic text-muted-foreground/70">at</span>
              <span className="font-semibold text-gold-strong">80</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Celebrating the life, faith and legacy of {honoree.fullName},{" "}
              {honoree.honorific}.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {formatDate(event.startsAt)} · {event.city}
            </p>
          </div>

          <div className="text-sm">
            <p className="eyebrow mb-3">Explore</p>
            <ul className="space-y-2">
              {[
                { href: "/story", label: "Her Story" },
                { href: "/gallery", label: "Gallery" },
                { href: "/tributes", label: "Tributes" },
                { href: "/event", label: "The Celebration" },
                { href: "/rsvp", label: "RSVP" },
                { href: "/privacy", label: "Privacy Notice" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-sm">
            <p className="eyebrow mb-3">Connection</p>
            <p className="text-muted-foreground">
              On slower connections, enable Lite Mode for a lighter, faster
              experience.
            </p>
            <div className="mt-3">
              <LiteModeToggle />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} The family of {honoree.fullName}. Made
            with love.
          </p>
          <p className="italic">“{honoree.epigraph}”</p>
        </div>
      </div>
    </footer>
  );
}
