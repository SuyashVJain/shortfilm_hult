"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

type Props = {
  /** "cinematic" for public pages, "calm" for dashboards (near-solid dark). */
  variant?: "cinematic" | "calm";
};

/**
 * Fixed site backdrop. Portrait image on mobile, landscape on desktop.
 * A dark overlay deepens with scroll: bright in the hero, ~85% dark by
 * the time content sections arrive.
 */
export function BackgroundStage({ variant = "cinematic" }: Props) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const overlay = useTransform(scrollY, [0, 700], [0.35, 0.85], { clamp: true });

  if (variant === "calm") {
    return <div aria-hidden className="fixed inset-0 z-0 bg-bg" />;
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-bg">
      <Image
        src="/cinema/bg-mobile.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-bottom md:hidden"
      />
      <Image
        src="/cinema/bg-desktop.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hidden object-cover object-center md:block"
      />
      {/* Scroll-linked darkening */}
      <motion.div
        className="absolute inset-0 bg-bg"
        style={{ opacity: reduce ? 0.6 : overlay }}
      />
      {/* Keep the headline zone readable regardless of scroll */}
      <div className="absolute inset-x-0 top-0 h-2/3 bg-linear-to-b from-bg/70 to-transparent" />
    </div>
  );
}
