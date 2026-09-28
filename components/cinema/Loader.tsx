"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { FilmGrain } from "./FilmGrain";
import { LOADER_SEEN_KEY } from "./loader-boot";
import { finishLoader, useLoaderDone } from "./LoaderContext";

const STEP_MS = 800; // per numeral
const COUNT_MS = STEP_MS * 3; // 3, 2, 1
const EXIT_BY_MS = 2500; // leave by here even if images are still loading
const FADE_MS = 500;
const REDUCED_MS = 600;

const BACKDROPS = ["/cinema/bg-desktop.webp", "/cinema/bg-mobile.webp"];

function preload(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}

/**
 * Old-film countdown leader, shown once per session on public pages.
 * Server-rendered so first visits never flash the page underneath.
 */
export function Loader() {
  const done = useLoaderDone();
  const reduced = useReducedMotion() ?? false;
  const [count, setCount] = useState(3);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Skipped (seen this session, or a work route): the boot script already set data-loader="off".
    if (document.documentElement.dataset.loader === "off") return;
    try {
      sessionStorage.setItem(LOADER_SEEN_KEY, "1");
    } catch {}

    // Read directly for timing so a late hook value never restarts the timers.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    let left = false;

    const exit = () => {
      if (left) return;
      left = true;
      setLeaving(true);
      later(finishLoader, reduce ? 300 : FADE_MS);
    };

    if (reduce) {
      later(exit, REDUCED_MS);
    } else {
      later(() => setCount(2), STEP_MS);
      later(() => setCount(1), STEP_MS * 2);
      const loaded = Promise.all(BACKDROPS.map(preload));
      const minTime = new Promise((r) => later(() => r(null), COUNT_MS));
      Promise.all([loaded, minTime]).then(exit);
      later(exit, EXIT_BY_MS);
    }

    return () => {
      left = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  if (done) return null;

  return (
    <div
      id="cinema-loader"
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-bg transition-opacity ease-out"
      style={{
        opacity: leaving ? 0 : 1,
        transitionDuration: `${reduced ? 300 : FADE_MS}ms`,
        ["--s" as string]: "min(62vw, 58vh, 58dvh)",
      }}
    >
      <FilmGrain opacity={0.1} />
      <div aria-hidden className="loader-flicker pointer-events-none absolute inset-0" />

      {/* Hidden by CSS under reduced motion, so the server HTML is already right. */}
      <div aria-hidden className="loader-countdown relative" style={{ width: "var(--s)", height: "var(--s)" }}>
          <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full text-cream">
            <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="0.8" />
            <circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.6" />
            <line x1="0" y1="100" x2="200" y2="100" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.6" />
            <line x1="100" y1="0" x2="100" y2="200" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.6" />
          </svg>
          {/* Radial sweep, one turn per second */}
          <div className="loader-sweep absolute inset-0">
            <span className="absolute top-[2%] left-1/2 h-[48%] w-px -translate-x-1/2 bg-cream/70" />
          </div>
          <span
            key={count}
            className="loader-numeral absolute inset-0 flex items-center justify-center font-display leading-none text-cream"
            style={{ fontSize: "calc(var(--s) * 0.5)" }}
          >
            {count}
          </span>
      </div>

      <p className="loader-label relative mt-[min(5vh,40px)] text-[clamp(9px,min(1.6dvh,2.8vw),13px)] font-medium uppercase tracking-label text-cream/75">
        Real Stories <span className="mx-2 text-red">|</span> Brighter Tomorrows
      </p>
    </div>
  );
}
