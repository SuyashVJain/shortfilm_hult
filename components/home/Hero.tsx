"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Letterbox, LightLeak } from "@/components/cinema";
import { ButtonLink } from "@/components/ui";

const ease = [0.16, 1, 0.3, 1] as const;

function Line({ children, delay, className = "" }: { children: React.ReactNode; delay: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block"
        initial={reduce ? { opacity: 0 } : { y: "105%" }}
        animate={reduce ? { opacity: 1 } : { y: "0%" }}
        transition={{ duration: reduce ? 0.3 : 1.1, delay: reduce ? 0 : delay, ease }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function Fade({ children, delay, className = "" }: { children: React.ReactNode; delay: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.3 : 1, delay: reduce ? 0 : delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Brush-stroke underline under "Competition". */
function Swoosh() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 600 40" preserveAspectRatio="none" aria-hidden className="absolute -bottom-[0.18em] left-[4%] h-[0.28em] w-[96%] overflow-visible">
      <motion.path
        d="M4 30 C 140 12, 330 6, 596 10 C 420 14, 230 22, 60 36 Z"
        fill="var(--color-red)"
        initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 0 : 1 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: reduce ? 0.3 : 1.2, delay: reduce ? 0 : 2.6, ease }}
      />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-28 text-center sm:px-10">
      <Letterbox />
      <LightLeak className="top-[18%] left-1/2 h-[45vh] w-[90vw] max-w-5xl -translate-x-1/2" intensity={0.4} />

      <Fade delay={0.2}>
        <p className="text-[0.62rem] font-medium uppercase tracking-[var(--tracking-label)] text-cream/85 sm:text-xs">
          Real Stories <span className="mx-2 text-red">|</span> Brighter Tomorrows
        </p>
      </Fade>

      <h1 className="relative mt-8 sm:mt-10">
        <span className="sr-only">Short Film Competition</span>
        <span aria-hidden className="block font-display uppercase leading-[0.86] text-cream">
          {/* Mobile: SHORT and FILM stack. Desktop: one line filling the width. */}
          <span className="flex flex-col text-[clamp(5.5rem,30vw,9rem)] sm:flex-row sm:justify-center sm:gap-[0.22em] sm:text-[clamp(7rem,16vw,15rem)]">
            <Line delay={0.5}>Short</Line>
            <Line delay={0.95}>Film</Line>
          </span>
        </span>
        <span aria-hidden className="relative -mt-[0.42em] block font-script text-[clamp(3.6rem,19vw,5.6rem)] leading-none text-red sm:-mt-[0.5em] sm:text-[clamp(4.5rem,10vw,9.5rem)]">
          <Line delay={1.7} className="overflow-visible! pb-[0.25em]">
            <span className="relative inline-block -rotate-[7deg] px-[0.1em] drop-shadow-[0_6px_24px_rgb(0_0_0/0.65)]">
              Competition
              <Swoosh />
            </span>
          </Line>
        </span>
      </h1>

      <Fade delay={2.4} className="mt-8 max-w-md sm:mt-10 sm:max-w-none">
        <p className="text-[0.62rem] font-medium uppercase leading-relaxed tracking-[var(--tracking-label)] text-cream-muted sm:text-xs">
          Four goals. Countless perspectives.
          <br className="sm:hidden" /> Your story can make a difference.
        </p>
      </Fade>

      <Fade delay={2.8} className="mt-10 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4">
        <ButtonLink href="/register" variant="primary">
          Register your team
        </ButtonLink>
        <ButtonLink href="/sdgs" variant="secondary">
          Explore the SDGs
        </ButtonLink>
      </Fade>
    </section>
  );
}
