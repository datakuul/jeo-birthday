"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Feather } from "lucide-react";

/**
 * Lite Mode — for guests on slow / metered connections.
 * Persists to localStorage and reflects onto <html data-lite> so CSS can react
 * with zero JS cost. Also auto-enables when the browser reports a saveData
 * connection or a slow effective type.
 */

const STORAGE_KEY = "janet80-lite";

type LiteContextValue = {
  lite: boolean;
  setLite: (v: boolean) => void;
  toggle: () => void;
};

const LiteContext = createContext<LiteContextValue | null>(null);

// The pre-paint init script lives in the root layout (a server component) so it
// runs as a real <script>; this module only handles the interactive toggle.

export function LiteModeProvider({ children }: { children: React.ReactNode }) {
  const [lite, setLiteState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Resolve the saved preference (or auto-detect slow/Save-Data) on mount,
    // then reflect it onto <html> so CSS can react. Done post-hydration to keep
    // server and client markup identical (no flash for the common, full-experience case).
    let next = false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "true") next = true;
      else if (saved === null) {
        const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
        if (c?.saveData || /2g/.test(c?.effectiveType ?? "")) next = true;
      }
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time preference load
    setLiteState(next);
    document.documentElement.setAttribute("data-lite", next ? "true" : "false");
    setReady(true);
  }, []);

  const setLite = (v: boolean) => {
    setLiteState(v);
    try {
      localStorage.setItem(STORAGE_KEY, String(v));
    } catch {}
    document.documentElement.setAttribute("data-lite", v ? "true" : "false");
  };

  return (
    <LiteContext.Provider
      value={{ lite, setLite, toggle: () => setLite(!lite) }}
    >
      {/* avoid hydration mismatch flash on the toggle label */}
      <span data-ready={ready} className="contents">
        {children}
      </span>
    </LiteContext.Provider>
  );
}

export function useLiteMode() {
  const ctx = useContext(LiteContext);
  if (!ctx) {
    // Allow use outside provider (returns inert defaults)
    return { lite: false, setLite: () => {}, toggle: () => {} };
  }
  return ctx;
}

export function LiteModeToggle({ className = "" }: { className?: string }) {
  const { lite, toggle } = useLiteMode();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={lite}
      className={
        "inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-gold hover:text-foreground " +
        className
      }
      title="Lite Mode reduces images and animations for slower connections"
    >
      <Feather className="size-3.5" aria-hidden />
      Lite Mode
      <span
        className={
          "ml-0.5 inline-block size-2 rounded-full " +
          (lite ? "bg-gold-strong" : "bg-border")
        }
        aria-hidden
      />
      <span className="sr-only">{lite ? "on" : "off"}</span>
    </button>
  );
}
