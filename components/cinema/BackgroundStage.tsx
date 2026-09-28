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
  const overlay = useTransform(scrollY, [0, 700], [0.12, 0.85], { clamp: true });

  if (variant === "calm") {
    return <div aria-hidden className="fixed inset-0 z-0 bg-bg" />;
  }

  return (
    <div aria-hidden className="pointer-events-none fixed top-0 left-0 z-0 h-dvh w-screen overflow-hidden bg-bg">
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
      {/* Soft edge shade, light enough that the top of the image still reads */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 55%, rgb(5 5 5 / 0.35) 100%)" }}
      />
    </div>
  );
}
