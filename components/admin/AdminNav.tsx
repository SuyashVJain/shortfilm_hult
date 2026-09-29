"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/site/SignOutButton";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/jury", label: "Jury" },
  { href: "/admin/settings", label: "Settings" },
];

const small = "text-xs font-medium uppercase tracking-[0.2em]";

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  return (
    <header className="sticky top-0 z-30 border-b border-divider bg-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 sm:px-8">
        <Link href="/admin" className="font-display text-lg uppercase tracking-wide text-cream">
          Admin
        </Link>
        <nav aria-label="Admin" className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active(l.href) ? "page" : undefined}
              className={`${small} flex min-h-11 items-center whitespace-nowrap px-3 transition-colors ${
                active(l.href) ? "text-cream underline decoration-red decoration-2 underline-offset-8" : "text-cream/60 hover:text-cream"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-5">
          <span className="hidden max-w-[16rem] truncate text-xs text-cream/50 md:inline">{email}</span>
          <Link href="/" className={`${small} text-cream/60 hover:text-cream`}>
            Public site
          </Link>
          <SignOutButton className={`${small} min-h-11 text-cream/60 hover:text-cream`} />
        </div>
      </div>
    </header>
  );
}
