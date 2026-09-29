import Link from "next/link";
import { notFound } from "next/navigation";
import { LockToggle } from "@/components/admin/LockToggle";
import { FilmReview } from "@/components/admin/FilmReview";
import { TeamLocationSelect, UnlockEvaluationButton } from "@/components/admin/JuryAdmin";
import { round2, summarise, type ScoreMap } from "@/lib/scoring";
import { PaymentReview } from "@/components/admin/PaymentReview";
import { ScreenshotDialog } from "@/components/admin/ScreenshotDialog";
import { StatusBadge } from "@/components/ui";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/guards";
import { PAYMENT_LABEL, PAYMENT_TONE, SUBMISSION_LABEL } from "@/lib/payment-status";
import { getSettings } from "@/lib/settings";

const FILM_TONE = { NOT_SUBMITTED: "neutral", SUBMITTED: "pending", UNDER_REVIEW: "pending", APPROVED: "ok", REJECTED: "bad" } as const;
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
        submission: {
          include: {
            evaluations: {
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                scores: true,
                comment: true,
                locked: true,
                lockedAt: true,
                adminUnlockedAt: true,
                juryAccount: { select: { displayName: true, username: true, location: { select: { name: true } } } },
              },
            },
          },
        },
        location: { select: { id: true, name: true } },
      },
    }),
    getSettings(),
  ]);
  const locations = await db.location.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  if (!team) notFound();

  const film = team.submission && team.submission.status !== "NOT_SUBMITTED" ? team.submission : null;
  const criteria = settings.evaluationCriteria.map((c) => ({ key: c.key, title: c.title }));
  const evaluations = (film?.evaluations ?? []).filter((e) => e.locked && !e.adminUnlockedAt);
  const allEvaluations = film?.evaluations ?? [];
  const summary = summarise(criteria, evaluations.map((e) => ({ scores: e.scores as ScoreMap })));
  const theme = film ? settings.sdgThemes.find((t) => t.number === film.sdg) : undefined;
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

      <Section title="Film submission">
        {/* FilmSubmission is the source of truth for film content. */}
        {film ? (
          <div className="space-y-4">
            <StatusBadge tone={FILM_TONE[film.status]}>{SUBMISSION_LABEL[film.status]}</StatusBadge>
            <dl>
              <Row label="SDG">{theme ? `${theme.number} · ${theme.title}` : film.sdg}</Row>
              <Row label="Title">{film.title}</Row>
              <Row label="Drive link">
                <a href={film.driveUrl} target="_blank" rel="noopener noreferrer" className="break-all underline underline-offset-4">
                  {film.driveUrl}
                </a>
              </Row>
              <Row label="Synopsis">
                <span className="whitespace-pre-line">{film.synopsis}</span>
              </Row>
              {film.credits && (
                <Row label="Credits">
                  <span className="whitespace-pre-line">{film.credits}</span>
                </Row>
              )}
              {film.submittedAt && <Row label="Submitted">{date.format(film.submittedAt)}</Row>}
              {film.adminNote &&
                (film.status === "REJECTED" ? (
                  <Row label="Rejection reason">{film.adminNote}</Row>
                ) : (
                  // Kept as history (like an old rejected payment row); it refers to the earlier version.
                  <Row label="Previous note">
                    <span className="text-cream/60">{film.adminNote}</span>{" "}
                    <span className="text-xs text-cream/45">(from an earlier rejection, before the team resubmitted)</span>
                  </Row>
                ))}
            </dl>
            {/* Keyed so a stale "rejected" message never survives a resubmission. */}
            <FilmReview key={`${film.status}-${film.submittedAt?.toISOString() ?? ""}`} submissionId={film.id} status={film.status} />
          </div>
        ) : (
          <p className="text-sm text-cream/60">Not submitted yet. Teams choose their SDG and film at film submission.</p>
        )}
      </Section>

      <Section title="Judging location">
        <TeamLocationSelect teamId={team.id} locationId={team.location?.id ?? ""} locations={locations} />
      </Section>

      <Section title={`Evaluations (${evaluations.length} submitted)`}>
        {allEvaluations.length === 0 ? (
          <p className="text-sm text-cream/60">No evaluations yet.</p>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto border border-divider">
              <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                <thead className="bg-charcoal-2">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-[0.65rem] uppercase tracking-[0.16em] text-cream-muted">Criterion</th>
                    {allEvaluations.map((e) => (
                      <th key={e.id} scope="col" className="px-3 py-2 text-[0.65rem] uppercase tracking-[0.16em] text-cream-muted">
                        {e.juryAccount.displayName}
                        {e.adminUnlockedAt && <span className="block normal-case tracking-normal text-[#ff6b77]">unlocked, excluded</span>}
                      </th>
                    ))}
                    <th scope="col" className="px-3 py-2 text-[0.65rem] uppercase tracking-[0.16em] text-cream">Sum</th>
                    <th scope="col" className="px-3 py-2 text-[0.65rem] uppercase tracking-[0.16em] text-cream">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((c, i) => (
                    <tr key={c.key} className="border-t border-divider bg-charcoal">
                      <th scope="row" className="px-3 py-2 font-normal text-cream/85">{c.title}</th>
                      {allEvaluations.map((e) => (
                        <td key={e.id} className={`px-3 py-2 font-mono ${e.adminUnlockedAt ? "text-cream/35" : "text-cream"}`}>
                          {(e.scores as ScoreMap)[c.key] ?? "—"}
                        </td>
                      ))}
                      <td className="px-3 py-2 font-mono text-cream">{summary.perCriterion[i].sum}</td>
                      <td className="px-3 py-2 font-mono text-cream">{round2(summary.perCriterion[i].average)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-cream/30 bg-charcoal-2">
                    <th scope="row" className="px-3 py-2 text-[0.65rem] uppercase tracking-[0.16em] text-cream-muted">Total</th>
                    {allEvaluations.map((e) => (
                      <td key={e.id} className={`px-3 py-2 font-mono ${e.adminUnlockedAt ? "text-cream/35" : "text-cream"}`}>
                        {criteria.reduce((a, c) => a + Number((e.scores as ScoreMap)[c.key] ?? 0), 0)}
                      </td>
                    ))}
                    <td className="px-3 py-2 font-mono text-cream">{summary.totals.reduce((a, b) => a + b, 0)}</td>
                    <td className="px-3 py-2 font-mono text-cream">{round2(summary.overallAverageTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-cream/50">
              Sums and averages use the {summary.jurors} submitted {summary.jurors === 1 ? "evaluation" : "evaluations"}. The overall average is the
              mean of each juror&rsquo;s total. Unlocked evaluations are excluded until resubmitted.
            </p>
            <ul className="space-y-3">
              {allEvaluations.map((e) => (
                <li key={e.id} className="border border-divider bg-charcoal p-4 text-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-cream">{e.juryAccount.displayName}</span>
                    <span className="font-mono text-xs text-cream/50">{e.juryAccount.username} · {e.juryAccount.location.name}</span>
                    {e.adminUnlockedAt ? (
                      <StatusBadge tone="bad">Unlocked for correction</StatusBadge>
                    ) : (
                      <StatusBadge tone="ok">Submitted{e.lockedAt ? ` · ${date.format(e.lockedAt)}` : ""}</StatusBadge>
                    )}
                    {e.locked && !e.adminUnlockedAt && (
                      <span className="ml-auto">
                        <UnlockEvaluationButton id={e.id} />
                      </span>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-line text-cream/75">{e.comment || <span className="text-cream/40">No comment</span>}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
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
