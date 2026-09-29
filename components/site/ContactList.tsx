import { CONTACTS, formatPhone, INSTAGRAM, whatsappUrl } from "@/lib/contacts";

const pageLink =
  "mt-1 inline-flex min-h-11 items-center text-cream/85 underline decoration-cream/30 underline-offset-4 transition-colors hover:text-cream hover:decoration-cream";

// Footer: same scale as the footer's nav links; compact rows with a ~28px tap height.
const footLink =
  "inline-flex min-h-7 items-center text-xs text-cream/75 underline decoration-cream/25 underline-offset-4 transition-colors hover:text-cream hover:decoration-cream";

/**
 * Organiser contacts: WhatsApp links for each person plus Instagram.
 * `compact` is the footer variant (one tight block); the default is the page section.
 */
export function ContactList({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <ul className="space-y-2">
        {CONTACTS.map((c) => (
          <li key={c.phone}>
            <p className="text-[0.7rem] text-cream/55">
              {c.name}, {c.role}
            </p>
            <a
              href={whatsappUrl(c.phone)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp ${c.name} at ${formatPhone(c.phone)}`}
              className={footLink}
            >
              {formatPhone(c.phone)} · WhatsApp
            </a>
          </li>
        ))}
        <li>
          <p className="text-[0.7rem] text-cream/55">Instagram</p>
          <a href={INSTAGRAM.url} target="_blank" rel="noopener noreferrer" className={footLink}>
            {INSTAGRAM.handle}
          </a>
        </li>
      </ul>
    );
  }

  return (
    <ul className="grid gap-px border border-divider bg-divider sm:grid-cols-3">
      {CONTACTS.map((c) => (
        <li key={c.phone} className="bg-bg/90 px-5 py-5">
          <p className="text-lg text-cream">{c.name}</p>
          <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-cream-muted">{c.role}</p>
          <a
            href={whatsappUrl(c.phone)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp ${c.name} at ${formatPhone(c.phone)}`}
            className={pageLink}
          >
            {formatPhone(c.phone)} <span className="ml-2 text-[0.65rem] uppercase tracking-[0.18em] text-cream/45">WhatsApp</span>
          </a>
        </li>
      ))}
      <li className="bg-bg/90 px-5 py-5">
        <p className="text-lg text-cream">Instagram</p>
        <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-cream-muted">Updates and announcements</p>
        <a href={INSTAGRAM.url} target="_blank" rel="noopener noreferrer" className={pageLink}>
          {INSTAGRAM.handle}
        </a>
      </li>
    </ul>
  );
}
