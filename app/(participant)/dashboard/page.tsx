import { ResubmitPayment } from "@/components/dashboard/ResubmitPayment";
import { Timeline, type TimelineStep } from "@/components/dashboard/Timeline";
import { ButtonLink, StatusBadge } from "@/components/ui";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/guards";
import { PAYMENT_LABEL, PAYMENT_TONE } from "@/lib/payment-status";
import { getSettings } from "@/lib/settings";

const date = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
const NOT_CHOSEN = "Not yet chosen. You'll pick this when film submission opens.";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-divider pt-6">
      <h2 className="text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-3 py-1.5 text-sm sm:grid-cols-[10rem_1fr]">
      <dt className="text-cream/50">{label}</dt>
      <dd className="wrap-break-word text-cream">{children}</dd>
    </div>
  );
}

export default async function DashboardPage() {
  const { user } = await requireRole("PARTICIPANT");

  // Scoped to the signed-in leader's own team only.
  const team = await db.team.findUnique({
    where: { leaderId: user.id },
    select: {
      name: true,
      code: true,
      leaderName: true,
      whatsapp: true,
      branch: true,
      semester: true,
      sdg: true,
      filmTitle: true,
      locked: true,
      members: {
        orderBy: [{ isLeader: "desc" }, { fullName: "asc" }],
        select: { id: true, fullName: true, enrollmentNumber: true, branch: true, semester: true, isLeader: true },
      },
      payments: {
        orderBy: { submittedAt: "desc" },
        take: 1,
        select: { status: true, rejectReason: true, utr: true, amount: true, submittedAt: true },
      },
    },
  });

  if (!team) {
    return (
      <div className="py-16">
        <p className="text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">Your team</p>
        <h1 className="mt-3 font-display text-4xl uppercase text-cream sm:text-5xl">No team yet</h1>
        <p className="mt-4 max-w-md text-cream/70">Register your team to take part in the competition.</p>
        <ButtonLink href="/register" className="mt-8">
          Register your team
        </ButtonLink>
      </div>
    );
  }

  const settings = await getSettings();
  const latest = team.payments[0];
  const canResubmit = latest?.status === "REJECTED" && !team.locked;
  const theme = team.sdg != null ? settings.sdgThemes.find((t) => t.number === team.sdg) : undefined;

  // Computed, not stored (architecture §5). Future steps are shown as upcoming only.
  const steps: TimelineStep[] = [
    { label: "Registered", state: "done" },
    {
      label: "Payment reviewed",
      state: latest?.status === "VERIFIED" ? "done" : "current",
      note: latest ? (latest.status === "VERIFIED" ? undefined : latest.status === "REJECTED" ? "Rejected: action needed" : "Needs review") : "Not submitted",
    },
    {
      label: "Film submission",
      state: settings.submissionOpen ? "current" : "upcoming",
      note: settings.submissionOpen ? "Open" : "Not yet open",
    },
    { label: "Results", state: "upcoming" },
  ];

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">Welcome,</p>
        <h1 className="mt-2 font-display text-4xl uppercase leading-none text-cream wrap-break-word sm:text-6xl">{team.name}</h1>
        <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">Team ID</span>
          <span className="font-mono text-2xl text-cream">{team.code}</span>
        </p>
        {team.locked && (
          <p className="mt-3">
            <StatusBadge tone="neutral">Editing locked by the organisers</StatusBadge>
          </p>
        )}
      </header>

      <Section title="Progress">
        <Timeline steps={steps} />
      </Section>

      <Section title="Payment">
        {latest ? (
          <>
            <StatusBadge tone={PAYMENT_TONE[latest.status]}>{PAYMENT_LABEL[latest.status]}</StatusBadge>
            <dl className="mt-3">
              <Row label="UTR">
                <span className="font-mono">{latest.utr}</span>
              </Row>
              <Row label="Amount">₹{latest.amount}</Row>
              <Row label="Submitted">{date.format(latest.submittedAt)}</Row>
            </dl>
            {latest.status === "PENDING" && (
              <p className="mt-3 text-sm text-cream/60">The organisers will check your payment. You can use your dashboard meanwhile.</p>
            )}
            {latest.status === "REJECTED" && (
              <div className="mt-6 max-w-xl border-l-2 border-red bg-charcoal px-5 py-5">
                <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#ff6b77]">Payment rejected</p>
                {latest.rejectReason && <p className="mt-2 text-cream">Reason: {latest.rejectReason}</p>}
                {canResubmit ? (
                  <ResubmitPayment fee={settings.registrationFee} />
                ) : (
                  <p className="mt-3 text-sm text-cream/70">Your registration is locked. Please contact the organisers.</p>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-cream/70">No payment on record.</p>
        )}
      </Section>

      <Section title="Film">
        <dl>
          <Row label="SDG">{theme ? `SDG ${theme.number} · ${theme.title}` : team.sdg != null ? `SDG ${team.sdg}` : NOT_CHOSEN}</Row>
          <Row label="Film title">{team.filmTitle ?? "Not yet chosen"}</Row>
        </dl>
      </Section>

      <Section title="Team leader">
        <dl>
          <Row label="Name">{team.leaderName}</Row>
          <Row label="Email">{user.email}</Row>
          <Row label="WhatsApp">{team.whatsapp}</Row>
          <Row label="Branch">{team.branch}</Row>
          <Row label="Semester">{team.semester}</Row>
        </dl>
      </Section>

      <Section title={`Members (${team.members.length})`}>
        {/* Stacked rows: readable on phones without a wide table. */}
        <ol className="divide-y divide-divider border border-divider">
          {team.members.map((m, i) => (
            <li key={m.id} className="grid gap-1 bg-charcoal px-4 py-3 text-sm sm:grid-cols-[2rem_1.4fr_1fr_1fr_4rem] sm:items-center sm:gap-4">
              <span className="text-cream/40">{i + 1}.</span>
              <span className="text-cream">
                {m.fullName}
                {m.isLeader && <span className="ml-2 text-[0.65rem] uppercase tracking-[0.2em] text-red">Leader</span>}
              </span>
              <span className="font-mono text-cream/80">{m.enrollmentNumber}</span>
              <span className="text-cream/70">{m.branch}</span>
              <span className="text-cream/70">Sem {m.semester}</span>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
