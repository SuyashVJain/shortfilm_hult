import Link from "next/link";

export const metadata = { title: "Page not found | Short Film Competition" };

/** Site-wide 404: calm and on-brand instead of the framework default. */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-start justify-center bg-bg px-6 sm:px-16">
      <p className="text-[0.7rem] uppercase tracking-label text-cream-muted">404</p>
      <h1 className="mt-4 font-display text-5xl uppercase leading-none text-cream sm:text-7xl">This scene isn&rsquo;t here</h1>
      <p className="mt-6 max-w-md text-cream/70">The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.</p>
      <Link
        href="/"
        className="mt-10 inline-flex min-h-12 items-center bg-red px-7 text-xs font-semibold uppercase tracking-[0.28em] text-cream"
      >
        Back to home
      </Link>
    </main>
  );
}
