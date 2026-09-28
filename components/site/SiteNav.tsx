"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLoaderDone } from "@/components/cinema";
import { authClient } from "@/lib/auth-client";
import { homeForRole, toRole } from "@/lib/roles";
import { SignOutButton } from "./SignOutButton";
import { Wordmark } from "./Wordmark";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/competition", label: "The Competition" },
  { href: "/sdgs", label: "SDG Themes" },
  { href: "/guidelines", label: "Guidelines" },
  { href: "/register", label: "Register" },
];

const small = "text-[0.7rem] font-medium uppercase tracking-[0.24em]";

/** Login, or Dashboard + Sign out when signed in. */
function AccountLinks({ className = "", onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) return <span className={className} />;
  if (!session) {
    return (
      <Link href="/login" onClick={onNavigate} className={`${small} text-cream/70 transition-colors hover:text-cream ${className}`}>
        Login
      </Link>
    );
  }
  return (
    <span className={`flex items-center gap-5 ${className}`}>
      <Link
        href={homeForRole(toRole(session.user.role))}
        onClick={onNavigate}
        className={`${small} text-cream/80 transition-colors hover:text-cream`}
      >
        Dashboard
      </Link>
      <SignOutButton className={`${small} text-cream/55 transition-colors hover:text-cream`} />
    </span>
  );
}

/**
 * Minimal site nav (design-system §10).
 * `overlay` (home only): transparent over the hero, no wordmark, fades in after the loader.
 */
export function SiteNav({ overlay = false }: { overlay?: boolean }) {
  const pathname = usePathname();
  const loaderDone = useLoaderDone();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Escape closes; Tab is trapped inside the open menu.
  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    const focusables = () =>
      Array.from(menu?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className={overlay ? "absolute inset-x-0 top-0 z-40" : "relative z-40"}>
      {overlay && (
        // Soft top-only shade so links stay readable over the backdrop.
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[calc(var(--nav-h)*1.6)] bg-linear-to-b from-bg/75 via-bg/35 to-transparent" />
      )}
      <nav
        aria-label="Main"
        className={`relative mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 sm:px-10 lg:px-16 ${
          overlay ? "h-(--nav-h) transition-opacity duration-1000 ease-out" : "py-5"
        }`}
        style={overlay ? { opacity: loaderDone ? 1 : 0 } : undefined}
      >
        {overlay ? <span aria-hidden className="hidden lg:block" /> : <Wordmark />}

        <ul className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`${small} transition-colors hover:text-cream ${
                  l.href === "/register"
                    ? overlay
                      ? "text-[#ff4d5c] hover:text-[#ff6b77]" // lighter red: AA contrast over the backdrop
                      : "text-red hover:text-red"
                    : isActive(l.href)
                      ? "text-cream"
                      : overlay
                        ? "text-cream/85"
                        : "text-cream/65"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Separated account action */}
        <div className="hidden border-l border-divider pl-7 lg:block">
          <AccountLinks />
        </div>

        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen(true)}
          className={`${small} -mr-3 ml-auto min-h-11 px-3 text-cream lg:hidden`}
        >
          Menu
        </button>
      </nav>

      {open && (
        <div
          ref={menuRef}
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col bg-bg/97 px-6 py-5 sm:px-10"
        >
          <div className="flex items-center justify-between">
            <Wordmark />
            <button type="button" onClick={close} className={`${small} -mr-3 min-h-11 px-3 text-cream`}>
              Close
            </button>
          </div>
          <ul className="mt-[8dvh] flex flex-col gap-[2.5dvh]">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={close}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`font-display text-[clamp(2.2rem,9vw,3.5rem)] uppercase leading-none ${
                    l.href === "/register" ? "text-red" : "text-cream"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto border-t border-divider pt-6 pb-2">
            <AccountLinks onNavigate={close} />
          </div>
        </div>
      )}
    </header>
  );
}

