import Link from "next/link";
import { notFound } from "next/navigation";
import { ScoreForm } from "@/components/jury/ScoreForm";
import { StatusBadge } from "@/components/ui";
import { db } from "@/lib/db";
import { requireJury } from "@/lib/jury-auth";
import { scaleFrom, type ScoreMap } from "@/lib/scoring";
import { getSettings } from "@/lib/settings";

const date = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-3 py-1.5 text-sm sm:grid-cols-[8rem_1fr]">
      <dt className="text-cream/50">{label}</dt>
      <dd className="wrap-break-word text-cream">{children}</dd>
    </div>
  );
}

export default async function JuryScorePage({ params }: PageProps<"/jury/[teamId]">) {
  const juror = await requireJury();
  const { teamId } = await params;
  if (!/^[\w-]{1,64}$/.test(teamId)) notFound();

  // Scoped to the juror's location; film only (no payment or member data).
  const team = await db.team.findFirst({
    where: { id: teamId, locationId: juror.locationId, submission: { status: "APPROVED" } },
    select: {
      code: true,
      name: true,
      submission: {
        select: {
          sdg: true,
          title: true,
          synopsis: true,
          driveUrl: true,
          evaluations: { where: { juryAccountId: juror.id }, select: { scores: true, comment: true, locked: true, lockedAt: true, adminUnlockedAt: true } },
        },
      },
    },
  });
  if (!team?.submission) notFound();

  const settings = await getSettings();
  const film = team.submission;
  const theme = settings.sdgThemes.find((t) => t.number === film.sdg);
  const mine = film.evaluations[0];
  const readOnly = !!mine?.locked && !mine.adminUnlockedAt;
  const scale = scaleFrom(settings.scoringScale);
  const criteria = settings.evaluationCriteria.map((c) => ({ key: c.key, title: c.title }));
  const myScores = (mine?.scores ?? {}) as ScoreMap;

  return (
    <div className="space-y-10">
      <div>
        <Link href="/jury" className="text-xs uppercase tracking-[0.2em] text-cream/55 hover:text-cream">
          ← Queue
        </Link>
        <p className="mt-4 font-mono text-sm text-cream/60">{team.code}</p>
        <h1 className="font-display text-4xl uppercase leading-none text-cream">{team.name}</h1>
      </div>

      <section className="border-t border-divider pt-6">
        <h2 className="text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">Film</h2>
        <dl className="mt-3">
          <Row label="SDG">{theme ? `SDG ${theme.number} · ${theme.title}` : `SDG ${film.sdg}`}</Row>
          <Row label="Title">{film.title}</Row>
          <Row label="Watch">
            <a href={film.driveUrl} target="_blank" rel="noopener noreferrer" className="break-all underline underline-offset-4 hover:text-white">
              Open film in Google Drive ↗
            </a>
          </Row>
          <Row label="Synopsis">
            <span className="whitespace-pre-line">{film.synopsis}</span>
          </Row>
        </dl>
      </section>

      <section className="border-t border-divider pt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">Your scores</h2>
          {readOnly && <StatusBadge tone="ok">Submitted{mine?.lockedAt ? ` · ${date.format(mine.lockedAt)}` : ""}</StatusBadge>}
          {mine?.adminUnlockedAt && <StatusBadge tone="bad">Unlocked for correction</StatusBadge>}
        </div>

        {readOnly ? (
          <div className="mt-4">
            <dl className="divide-y divide-divider border border-divider">
              {criteria.map((c) => (
                <div key={c.key} className="flex items-center justify-between gap-4 bg-charcoal px-4 py-3 text-sm">
                  <dt className="text-cream/80">{c.title}</dt>
                  <dd className="font-mono text-lg text-cream">{myScores[c.key] ?? "—"}</dd>
                </div>
              ))}
            </dl>
            {mine?.comment && <p className="mt-4 whitespace-pre-line text-sm text-cream/75">Comment: {mine.comment}</p>}
            <p className="mt-4 text-sm text-cream/55">Your scores are final. Contact the organisers if a correction is needed.</p>
          </div>
        ) : (
          <div className="mt-4">
            {mine?.adminUnlockedAt && (
              <p className="mb-4 text-sm text-cream/70">An organiser unlocked your scores for correction. Resubmitting makes them final again.</p>
            )}
            <ScoreForm
              teamId={teamId}
              criteria={criteria}
              scale={scale}
              initialScores={myScores}
              initialComment={mine?.comment ?? ""}
            />
          </div>
        )}
      </section>
    </div>
  );
}
