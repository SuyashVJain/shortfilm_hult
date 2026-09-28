import Image from "next/image";

type Props = {
  /**
   * Static darkness level, set per page or layout (no scroll listeners).
   * "hero": image reads clearly. "content": darker for long reading pages.
   * "calm": near-solid dark for dashboards.
   */
  dim?: "hero" | "content" | "calm";
};

const FLAT: Record<"hero" | "content", string> = {
  hero: "bg-bg/35",
  content: "bg-bg/80",
};

/**
 * Fixed site backdrop, pure CSS layers:
 * image -> flat overlay -> soft legibility shades. Portrait image on mobile.
 * No JS-driven opacity and no fade-in, so nothing flashes after the loader.
 */
export function BackgroundStage({ dim = "hero" }: Props) {
  if (dim === "calm") {
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
      <div className={`absolute inset-0 ${FLAT[dim]}`} />
      {dim === "hero" && (
        <>
          {/* Light pool behind the title zone */}
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 40% at 50% 45%, rgb(5 5 5 / 0.25) 0%, transparent 70%)" }}
          />
          {/* Gentle shade behind the tagline and buttons */}
          <div className="absolute inset-x-0 bottom-0 h-[42%] bg-linear-to-t from-bg/65 via-bg/25 to-transparent" />
        </>
      )}
    </div>
  );
}
