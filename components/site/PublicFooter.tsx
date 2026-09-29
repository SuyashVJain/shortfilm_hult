import Link from "next/link";
import { Container, PartnerLogos } from "@/components/ui";
import { ContactList } from "./ContactList";
import { Wordmark } from "./Wordmark";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/competition", label: "The Competition" },
  { href: "/sdgs", label: "SDG Themes" },
  { href: "/guidelines", label: "Guidelines" },
  { href: "/register", label: "Register" },
  { href: "/login", label: "Login" },
];

export function PublicFooter() {
  return (
    <footer className="relative z-10 border-t border-divider bg-bg">
      <Container className="grid gap-10 py-14 md:grid-cols-[1fr_auto_auto] md:items-end md:gap-14">
        <div className="space-y-8">
          <Wordmark />
          <PartnerLogos className="justify-start!" />
          <p className="text-[0.7rem] uppercase tracking-label text-cream-muted">Hult Prize @ SUAS</p>
        </div>
        <section aria-labelledby="footer-contact">
          <h2 id="footer-contact" className="mb-3 text-[0.7rem] uppercase tracking-label text-cream-muted">
            Contact
          </h2>
          <ContactList compact />
        </section>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-1 sm:grid-cols-3 md:grid-cols-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`flex min-h-11 items-center text-xs uppercase tracking-[0.2em] transition-colors hover:text-cream ${
                    l.href === "/register" ? "text-red hover:text-red" : "text-cream/65"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </footer>
  );
}
