import Link from "next/link";
import { notFound } from "next/navigation";
import { LockToggle } from "@/components/admin/LockToggle";
import { PaymentReview } from "@/components/admin/PaymentReview";
import { ScreenshotDialog } from "@/components/admin/ScreenshotDialog";
import { StatusBadge } from "@/components/ui";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/guards";
import { PAYMENT_LABEL, PAYMENT_TONE, SUBMISSION_LABEL } from "@/lib/payment-status";
import { getSettings } from "@/lib/settings";

const date = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

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
    <div className="grid grid-cols-[8rem_1fr] gap-3 py-1 text-sm sm:grid-cols-[10rem_1fr]">
      <dt className="text-cream/50">{label}</dt>
      <dd className="break-words text-cream">{children}</dd>
    </div>
  );
}

export default async function AdminTeamPage({ params }: PageProps<"/admin/teams/[id]">) {
  await requireRole("ADMIN");
  const { id } = await params;
  if (!/^[\w-]{1,64}$/.test(id)) notFound();

  const [team, settings] = await Promise.all([
    db.team.findUnique({
      where: { id },
      include: {
        leader: { select: { email: true } },
        members: { orderBy: [{ isLeader: "desc" }, { fullName: "asc" }] },
        payments: { orderBy: { submittedAt: "desc" } },
        submission: { select: { status: true } },
      },
    }),
    getSettings(),
  ]);
  if (!team) notFound();

  const theme = settings.sdgThemes.find((t) => t.number === team.sdg);
  const latest = team.payments[0];

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/teams" className="text-xs uppercase tracking-[0.2em] text-cream/55 hover:text-cream">
          ← Teams
        </Link>
        <p className="mt-4 font-mono text-sm text-cream/60">{team.code}</p>
        <h1 className="font-display text-4xl uppercase text-cream">{team.name}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {latest ? (
            <StatusBadge tone={PAYMENT_TONE[latest.status]}>Payment: {PAYMENT_LABEL[latest.status]}</StatusBadge>
          ) : (
            <StatusBadge>No payment</StatusBadge>
          )}
          <StatusBadge>Film: {SUBMISSION_LABEL[team.submission?.status ?? "NOT_SUBMITTED"]}</StatusBadge>
          {team.locked && <StatusBadge tone="bad">Editing locked</StatusBadge>}
        </div>
      </div>

      <Section title="Editing">
        <LockToggle teamId={team.id} locked={team.locked} />
      </Section>

      <Section title="Leader">
        <dl>
          <Row label="Name">{team.leaderName}</Row>
          <Row label="Email">
            <a href={`mailto:${team.leader.email}`} className="underline underline-offset-4">
              {team.leader.email}
            </a>
          </Row>
          <Row label="WhatsApp">{team.whatsapp}</Row>
          <Row label="Branch">{team.branch}</Row>
          <Row label="Semester">{team.semester}</Row>
        </dl>
      </Section>

      <Section title={`Members (${team.members.length})`}>
        <ol className="space-y-1 text-sm">
          {team.members.map((m, i) => (
            <li key={m.id} className="text-cream">
              {i + 1}. {m.fullName}
              <span className="text-cream/55">
                {" "}
                · {m.enrollmentNumber} · {m.branch}, semester {m.semester}
                {m.isLeader && " · Team Leader"}
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Film idea">
        <dl>
          <Row label="SDG">{theme ? `${theme.number} · ${theme.title}` : team.sdg}</Row>
          <Row label="Title">{team.filmTitle}</Row>
          <Row label="Synopsis">
            <span className="whitespace-pre-line">{team.synopsis}</span>
          </Row>
          <Row label="SDG approach">
            <span className="whitespace-pre-line">{team.sdgApproach}</span>
          </Row>
        </dl>
      </Section>

      <Section title={`Payments (${team.payments.length})`}>
        <ul className="space-y-4">
          {team.payments.map((p, i) => (
            <li key={p.id} className="grid gap-4 border border-divider bg-charcoal p-4 sm:grid-cols-[auto_1fr]">
              <ScreenshotDialog src={p.screenshotUrl} label={`Payment screenshot, ${date.format(p.submittedAt)}`} />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={PAYMENT_TONE[p.status]}>{PAYMENT_LABEL[p.status]}</StatusBadge>
                  {i === 0 && <span className="text-xs uppercase tracking-[0.18em] text-cream/50">Latest</span>}
                </div>
                <dl>
                  <Row label="UTR">
                    <span className="font-mono">{p.utr}</span>
                  </Row>
                  <Row label="Amount">₹{p.amount}</Row>
                  <Row label="Submitted">{date.format(p.submittedAt)}</Row>
                  {p.reviewedAt && <Row label="Reviewed">{date.format(p.reviewedAt)}</Row>}
                  {p.rejectReason && <Row label="Reason">{p.rejectReason}</Row>}
                </dl>
                {i === 0 && p.status === "PENDING" && <PaymentReview paymentId={p.id} />}
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
