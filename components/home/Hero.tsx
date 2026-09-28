"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LightLeak, useLoaderDone } from "@/components/cinema";
import { ButtonLink } from "@/components/ui";

const ease = [0.16, 1, 0.3, 1] as const;

// Entrance delays count from the moment the countdown loader exits.

function Line({ children, delay, className = "" }: { children: React.ReactNode; delay: number; className?: string }) {
  const reduce = useReducedMotion();
  const go = useLoaderDone();
  const from = reduce ? { opacity: 0 } : { y: "140%" }; // clears the padded mask
  return (
    // Padded mask (cancelled by equal negative margin) so round tops, bottoms
    // and descenders are never clipped by overflow-hidden.
    <span className={`my-[-0.14em] block overflow-hidden py-[0.14em] ${className}`}>
      <motion.span
        className="block"
        initial={from}
        animate={go ? (reduce ? { opacity: 1 } : { y: "0%" }) : from}
        transition={{ duration: reduce ? 0.3 : 1.1, delay: reduce ? 0 : delay, ease }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function Fade({
  children,
  delay,
  className = "",
  style,
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  const go = useLoaderDone();
  const from = { opacity: 0, y: reduce ? 0 : 10 };
  return (
    <motion.div
      className={className}
      style={style}
      initial={from}
      animate={go ? { opacity: 1, y: 0 } : from}
      transition={{ duration: reduce ? 0.3 : 1, delay: reduce ? 0 : delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Unmasked fade and small rise, so script swashes are never clipped. */
function ScriptReveal({ children, delay }: { children: React.ReactNode; delay: number }) {
  const reduce = useReducedMotion();
  const go = useLoaderDone();
  const from = { opacity: 0, y: reduce ? 0 : "0.15em" };
  return (
    <motion.span
      className="block"
      initial={from}
      animate={go ? { opacity: 1, y: 0 } : from}
      transition={{ duration: reduce ? 0.3 : 1.1, delay: reduce ? 0 : delay, ease }}
    >
      {children}
    </motion.span>
  );
}

/** Brush-stroke underline under "Competition". */
function Swoosh() {
  const reduce = useReducedMotion();
  const go = useLoaderDone();
  const from = { pathLength: reduce ? 1 : 0, opacity: reduce ? 0 : 1 };
  return (
    <svg viewBox="0 0 600 40" preserveAspectRatio="none" aria-hidden className="absolute bottom-[0.04em] left-[10%] h-[0.24em] w-[86%] overflow-visible">
      <motion.path
        d="M4 30 C 140 12, 330 6, 596 10 C 420 14, 230 22, 60 36 Z"
        fill="var(--color-red)"
        initial={from}
        animate={go ? { pathLength: 1, opacity: 1 } : from}
        transition={{ duration: reduce ? 0.3 : 1.2, delay: reduce ? 0 : 2.6, ease }}
      />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="hero relative flex flex-col items-center justify-between overflow-hidden text-center">
      <LightLeak className="top-[18%] left-1/2 h-[45dvh] w-[90vw] max-w-5xl -translate-x-1/2" intensity={0.4} />

      {/* Middle: eyebrow and lockup, centred in the space below the nav (partner logos live in the nav) */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center" style={{ gap: "var(--gap)" }}>
        <Fade delay={0.2}>
          {/* Phones: two even lines, divider hidden. sm+: one line with the red divider. */}
          <p className="hero-label font-medium uppercase leading-relaxed tracking-[0.22em] text-balance text-cream/85 sm:tracking-label">
            <span className="block sm:inline">Real Stories</span>
            <span className="mx-2 hidden text-red sm:inline">|</span>
            <span className="block sm:inline">Brighter Tomorrows</span>
          </p>
        </Fade>

        <h1 className="relative">
          <span className="sr-only">Short Film Competition</span>
          <span aria-hidden className="block font-display uppercase leading-[0.86] text-cream">
            {/* Narrow: SHORT and FILM stack. Wide: one line. */}
            <span className="hero-title flex flex-col sm:flex-row sm:justify-center sm:gap-[0.22em]">
              <Line delay={0.5}>Short</Line>
              <Line delay={0.95}>Film</Line>
            </span>
          </span>
          <span aria-hidden className="hero-script relative mt-[-0.58em] block font-script leading-none text-red sm:mt-[-0.64em]">
            {/* No mask here: Mr Dafoe's C, p and swashes reach far outside the line box. */}
            <ScriptReveal delay={1.7}>
              <span className="relative inline-block -rotate-6 px-[0.18em] pt-[0.1em] pb-[0.3em] drop-shadow-[0_6px_24px_rgb(0_0_0/0.65)]">
                Competition
                <Swoosh />
              </span>
            </ScriptReveal>
          </span>
        </h1>
      </div>

      {/* Bottom: tagline and CTAs */}
      <div className="flex shrink-0 flex-col items-center" style={{ gap: "var(--gap)" }}>
        <Fade delay={2.4} className="hero-tagline relative max-w-md sm:max-w-none">
          {/* Soft dark pool so the tagline reads over the sunset glow. */}
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-x-16 -inset-y-8 -z-10 blur-xl"
            style={{ background: "radial-gradient(ellipse at center, rgb(5 5 5 / 0.6) 0%, rgb(5 5 5 / 0.3) 45%, transparent 75%)" }}
          />
          <p className="hero-label font-medium uppercase leading-relaxed tracking-[0.18em] text-balance text-cream/80 sm:tracking-label [text-shadow:0_1px_12px_rgb(0_0_0/0.6)]">
            Four goals. Countless perspectives.
            <br className="sm:hidden" /> Your story can make a difference.
          </p>
        </Fade>

        <Fade
          delay={2.8}
          className="flex w-full max-w-xs flex-col sm:w-auto sm:max-w-none sm:flex-row"
          style={{ gap: "min(1.6dvh, 16px)" }}
        >
          <ButtonLink href="/register" variant="primary" className="hero-btn">
            Register your team
          </ButtonLink>
          <ButtonLink href="/sdgs" variant="secondary" className="hero-btn">
            Explore the SDGs
          </ButtonLink>
        </Fade>
      </div>
    </section>
  );
}
