"use client";

import { useId, useState } from "react";
import type { SdgTheme } from "@/lib/settings-defaults";

/**
 * Large SDG tile: number in its accent colour, title, thin accent border.
 * Hover or focus adds a soft accent glow; click/tap toggles the description (aria-expanded).
 */
export function SDGCard({ theme }: { theme: SdgTheme }) {
  const [open, setOpen] = useState(false);
  const descId = useId();
  const num = String(theme.number).padStart(2, "0");

  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={descId}
      onClick={() => setOpen((o) => !o)}
      className="group relative flex min-h-64 w-full flex-col justify-between border bg-charcoal/80 p-6 text-left transition-[box-shadow,background-color] duration-700 ease-[var(--ease-cinema)] hover:bg-charcoal-2 focus-visible:bg-charcoal-2 sm:min-h-80 sm:p-8"
      style={{
        borderColor: `${theme.color}66`,
        boxShadow: open ? `0 0 60px -20px ${theme.color}` : undefined,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1px ${theme.color}, 0 0 50px -24px ${theme.color}` }}
      />
      <span>
        <span className="block font-display text-7xl leading-none sm:text-8xl" style={{ color: theme.color }}>
          {num}
        </span>
        <span className="mt-4 block max-w-xs font-display text-2xl uppercase leading-tight text-cream sm:text-3xl">
          {theme.title}
        </span>
      </span>
      <span
        id={descId}
        // Opens only on click/tap (hover just glows), so "Read more" always visibly does something.
        className={`mt-6 block overflow-hidden text-sm leading-relaxed text-cream/80 transition-[opacity,max-height] duration-700 ease-[var(--ease-cinema)] ${
          open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {theme.description}
      </span>
      <span className="mt-4 block text-[0.65rem] uppercase tracking-[0.24em] text-cream/50">
        SDG {theme.number} · {open ? "Show less" : "Read more"}
      </span>
    </button>
  );
}
