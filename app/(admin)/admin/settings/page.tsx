import { SettingsForms } from "@/components/admin/SettingsForms";
import { StatusBadge } from "@/components/ui";
import { requireRole } from "@/lib/guards";
import { isRegistrationOpen, getSettings } from "@/lib/settings";

/** ISO timestamp -> "yyyy-mm-ddThh:mm:ss" in India time for <input type="datetime-local" step="1">. */
function toIstLocal(iso: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;
}

function ReadOnly({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-divider bg-charcoal p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">{title}</h2>
        <StatusBadge>Read-only</StatusBadge>
      </div>
      <div className="mt-4 text-sm">{children}</div>
    </section>
  );
}

export default async function AdminSettingsPage() {
  await requireRole("ADMIN");
  const [s, regOpen] = await Promise.all([getSettings(), isRegistrationOpen()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl uppercase text-cream">Settings</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusBadge tone={regOpen ? "ok" : "bad"}>Registration {regOpen ? "open now" : "closed now"}</StatusBadge>
          <StatusBadge tone={s.submissionOpen ? "ok" : "neutral"}>Film submission {s.submissionOpen ? "open" : "not open"}</StatusBadge>
        </div>
        <p className="mt-3 max-w-prose text-sm text-cream/60">
          Each section saves on its own. Changes appear on the public pages and dashboards straight away.
        </p>
      </div>

      <SettingsForms
        initial={{
          deadlineLocal: toIstLocal(s.registrationDeadline),
          registrationOpen: s.registrationOpen,
          registrationFee: s.registrationFee,
          minTeamSize: s.minTeamSize,
          maxTeamSize: s.maxTeamSize,
          maxFilmDurationMinutes: s.maxFilmDurationMinutes,
          submissionOpen: s.submissionOpen,
          paymentText: s.paymentInstructions.text,
          qrImageUrl: s.paymentInstructions.qrImageUrl ?? "",
          prizeText: s.prizeText,
        }}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <ReadOnly title="SDG themes">
          <ul className="space-y-3">
            {s.sdgThemes.map((t) => (
              <li key={t.number} className="border-l-2 pl-3" style={{ borderColor: t.color }}>
                <p className="text-cream">
                  SDG {t.number} · {t.title} <span className="font-mono text-xs text-cream/45">{t.color}</span>
                </p>
                <p className="mt-0.5 text-cream/60">{t.description}</p>
              </li>
            ))}
          </ul>
        </ReadOnly>
        <div className="space-y-5">
          <ReadOnly title="Award categories">
            <ul className="space-y-1.5">
              {s.awardCategories.map((a) => (
                <li key={a.key} className="text-cream">
                  {a.title} {a.proposed && <span className="text-xs text-cream/50">(proposed)</span>}
                  <span className="ml-2 font-mono text-xs text-cream/40">{a.key}</span>
                </li>
              ))}
            </ul>
          </ReadOnly>
          <ReadOnly title="Evaluation criteria">
            <ol className="list-decimal space-y-1.5 pl-5 marker:text-cream/40">
              {s.evaluationCriteria.map((c) => (
                <li key={c.key} className="text-cream">
                  {c.title}
                  {c.weight != null && <span className="ml-2 text-xs text-cream/50">weight {c.weight}</span>}
                  <span className="ml-2 font-mono text-xs text-cream/40">{c.key}</span>
                </li>
              ))}
            </ol>
          </ReadOnly>
        </div>
      </div>
    </div>
  );
}
