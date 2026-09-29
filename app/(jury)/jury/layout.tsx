import type { Metadata } from "next";
import Link from "next/link";
import { getJury } from "@/lib/jury-auth";
import { juryLogout } from "./actions";

export const metadata: Metadata = { title: "Jury | Short Film Competition", robots: { index: false } };

const small = "text-xs font-medium uppercase tracking-[0.2em]";

// Calm work area (like /admin). Pages still call requireJury() themselves.
export default async function JuryLayout({ children }: { children: React.ReactNode }) {
  const juror = await getJury();
  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-30 border-b border-divider bg-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3 sm:px-8">
          <Link href="/jury" className="font-display text-lg uppercase tracking-wide text-cream">
            Jury
          </Link>
          {juror && (
            <span className="text-xs text-cream/55">
              {juror.displayName} · {juror.locationName}
            </span>
          )}
          {juror && (
            <form action={juryLogout} className="ml-auto">
              <button type="submit" className={`${small} min-h-11 text-cream/60 hover:text-cream`}>
                Sign out
              </button>
            </form>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
