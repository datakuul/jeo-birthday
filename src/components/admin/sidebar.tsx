"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  MailCheck,
  Armchair,
  Images,
  BookOpen,
  MessageSquareQuote,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/admin/actions";

const nav = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/guests", label: "Guests", Icon: Users },
  { href: "/admin/rsvps", label: "RSVPs", Icon: MailCheck },
  { href: "/admin/seating", label: "Seating", Icon: Armchair },
  { href: "/admin/gallery", label: "Gallery", Icon: Images },
  { href: "/admin/story", label: "Story", Icon: BookOpen },
  { href: "/admin/tributes", label: "Tributes", Icon: MessageSquareQuote },
];

export function AdminSidebar({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="flex flex-1 flex-col gap-1">
      {nav.map((n) => {
        const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-gold-soft text-foreground"
                : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
            )}
          >
            <n.Icon className="size-4" />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <Link href="/admin" className="font-serif text-base">
          Janet<span className="text-gold-strong"> at 80</span> · Admin
        </Link>
        <button onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface p-4 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link href="/admin" className="mb-6 hidden px-2 lg:block">
          <span className="font-serif text-lg">
            Janet<span className="text-gold-strong"> at 80</span>
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Family Admin
          </span>
        </Link>

        {links}

        <div className="mt-4 border-t border-border pt-4">
          <Link
            href="/"
            target="_blank"
            className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-4" />
            View public site
          </Link>
          {email && (
            <p className="truncate px-3 py-1 text-xs text-muted-foreground" title={email}>
              {email}
            </p>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-muted hover:text-destructive"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
    </>
  );
}
