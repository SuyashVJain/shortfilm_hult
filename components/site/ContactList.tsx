import { CONTACTS, formatPhone, INSTAGRAM, whatsappUrl } from "@/lib/contacts";

/**
 * Organiser contacts: WhatsApp links for each person plus Instagram.
 * `compact` is the footer variant; the default is the page section variant.
 */
export function ContactList({ compact = false }: { compact?: boolean }) {
  const link =
    "inline-flex min-h-11 items-center underline decoration-cream/30 underline-offset-4 transition-colors hover:text-cream hover:decoration-cream";
  return (
    <ul className={compact ? "space-y-3 text-sm" : "grid gap-px border border-divider bg-divider sm:grid-cols-3"}>
      {CONTACTS.map((c) => (
        <li key={c.phone} className={compact ? "" : "bg-bg/90 px-5 py-5"}>
          <p className={compact ? "text-cream/85" : "text-lg text-cream"}>{c.name}</p>
          <p className={`text-[0.65rem] uppercase tracking-[0.2em] ${compact ? "text-cream/50" : "mt-1 text-cream-muted"}`}>{c.role}</p>
          <a
            href={whatsappUrl(c.phone)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp ${c.name} at ${formatPhone(c.phone)}`}
            className={`${link} ${compact ? "text-cream/70" : "mt-1 text-cream/85"}`}
          >
            {formatPhone(c.phone)} <span className="ml-2 text-[0.65rem] uppercase tracking-[0.18em] text-cream/45">WhatsApp</span>
          </a>
        </li>
      ))}
      <li className={compact ? "" : "bg-bg/90 px-5 py-5"}>
        <p className={compact ? "text-cream/85" : "text-lg text-cream"}>Instagram</p>
        <p className={`text-[0.65rem] uppercase tracking-[0.2em] ${compact ? "text-cream/50" : "mt-1 text-cream-muted"}`}>Updates and announcements</p>
        <a href={INSTAGRAM.url} target="_blank" rel="noopener noreferrer" className={`${link} ${compact ? "text-cream/70" : "mt-1 text-cream/85"}`}>
          {INSTAGRAM.handle}
        </a>
      </li>
    </ul>
  );
}
