"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lightweight scroll-reveal — IntersectionObserver + CSS only (no animation
 * library), to keep the public JS bundle tiny for low-bandwidth visitors.
 * Honours prefers-reduced-motion and Lite Mode via globals.css; content is
 * always visible without JS (see the <noscript> fallback in the root layout).
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "-60px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref}
      className={`reveal${shown ? " reveal-in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
