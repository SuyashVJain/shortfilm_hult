import Link from "next/link";

/** Small SHORT FILM / Competition lockup for the nav. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Short Film Competition, home" className={`relative inline-block leading-none ${className}`}>
      <span className="block font-display text-[1.35rem] uppercase leading-[0.9] tracking-wide text-cream">Short Film</span>
      <span className="-mt-[0.35em] ml-[0.6em] block -rotate-6 font-script text-[1.2rem] leading-none text-red drop-shadow-[0_2px_8px_rgb(0_0_0/0.6)]">
        Competition
      </span>
    </Link>
  );
}
