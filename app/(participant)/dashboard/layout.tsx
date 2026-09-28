import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/site/SignOutButton";
import { requireRole } from "@/lib/guards";

export const metadata: Metadata = { title: "Dashboard | Short Film Competition", robots: { index: false } };

const small = "text-xs font-medium uppercase tracking-[0.2em]";

// Calm work area like /admin: plain dark, no backdrop or atmosphere.
// The page and its actions still call requireRole themselves.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireRole("PARTICIPANT");
  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-30 border-b border-divider bg-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3 sm:px-8">
          <Link href="/dashboard" className="font-display text-lg uppercase tracking-wide text-cream">
            Dashboard
          </Link>
          <span className="hidden max-w-[16rem] truncate text-xs text-cream/50 sm:inline">{user.email}</span>
          <div className="ml-auto flex items-center gap-5">
            <Link href="/" className={`${small} flex min-h-11 items-center text-cream/60 hover:text-cream`}>
              Public site
            </Link>
            <SignOutButton className={`${small} min-h-11 text-cream/60 hover:text-cream`} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
