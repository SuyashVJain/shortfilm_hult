import Image from "next/image";
import type { Draft, RegisterSettings } from "./types";

function Section({ title, step, onEdit, children }: { title: string; step: number; onEdit: (s: number) => void; children: React.ReactNode }) {
  return (
    <section className="border-t border-divider py-5">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="-my-3 min-h-12 px-2 text-xs uppercase tracking-[0.2em] text-cream/70 underline underline-offset-4 hover:text-cream"
          aria-label={`Edit ${title.toLowerCase()}`}
        >
          Edit
        </button>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-3 py-1 text-sm sm:grid-cols-[11rem_1fr]">
      <dt className="uppercase tracking-[0.16em] text-cream/50">{label}</dt>
      <dd className="break-words text-cream">{value}</dd>
    </div>
  );
}

export function StepReview({
  draft,
  email,
  settings,
  onEdit,
}: {
  draft: Draft;
  email: string;
  settings: RegisterSettings;
  onEdit: (step: number) => void;
}) {
  const { details, members, film, payment } = draft;
  const theme = settings.sdgThemes.find((t) => t.number === film.sdg);
  return (
    <div>
      <Section title="Team" step={1} onEdit={onEdit}>
        <dl>
          <Row label="Team" value={details.teamName} />
          <Row label="Team size" value={members.length + 1} />
          <Row label="Leader" value={details.leaderName} />
          <Row label="Email" value={email} />
          <Row label="WhatsApp" value={details.whatsapp} />
          <Row label="Branch" value={`${details.branch}, semester ${details.semester}`} />
        </dl>
      </Section>
      <Section title="Members" step={2} onEdit={onEdit}>
        <ol className="space-y-1 text-sm text-cream">
          <li>
            1. {details.leaderName} <span className="text-cream/50">(Team Leader)</span>
          </li>
          {members.map((m, i) => (
            <li key={m.id}>
              {i + 2}. {m.fullName} <span className="text-cream/50">· {m.branch}, semester {m.semester}</span>
            </li>
          ))}
        </ol>
      </Section>
      <Section title="Film" step={3} onEdit={onEdit}>
        <dl>
          <Row label="Selected SDG" value={theme ? `${theme.number} · ${theme.title}` : "—"} />
          <Row label="Film" value={film.filmTitle} />
          <Row label="Synopsis" value={<span className="whitespace-pre-line">{film.synopsis}</span>} />
          <Row label="SDG approach" value={<span className="whitespace-pre-line">{film.sdgApproach}</span>} />
        </dl>
      </Section>
      <Section title="Payment" step={4} onEdit={onEdit}>
        <dl>
          <Row label="Registration" value={`₹${settings.registrationFee}`} />
          <Row label="UTR" value={payment.utr} />
        </dl>
        {payment.screenshotUrl && (
          <Image
            src={payment.screenshotUrl}
            alt="Payment screenshot"
            width={120}
            height={180}
            unoptimized
            className="mt-3 h-auto max-h-44 w-auto border border-divider object-contain"
          />
        )}
      </Section>
    </div>
  );
}
