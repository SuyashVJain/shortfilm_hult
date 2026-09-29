import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import { db } from "@/lib/db";
import { requireJury } from "@/lib/jury-auth";

/** The juror's queue: approved films from teams assigned to their location. No payment or member data. */
export default async function JuryQueuePage() {
  const juror = await requireJury();

  const teams = await db.team.findMany({
    where: { locationId: juror.locationId, submission: { status: "APPROVED" } },
    orderBy: { code: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      submission: {
        select: {
          title: true,
          sdg: true,
          // Only THIS juror's evaluation, never other jurors'.
          evaluations: { where: { juryAccountId: juror.id }, select: { locked: true, adminUnlockedAt: true } },
        },
      },
    },
  });

  const scored = teams.filter((t) => t.submission?.evaluations[0]?.locked && !t.submission.evaluations[0].adminUnlockedAt).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">{juror.locationName}</p>
        <h1 className="mt-2 font-display text-4xl uppercase text-cream">Your queue</h1>
        <p className="mt-2 text-sm text-cream/60">
          {teams.length === 0 ? "No films are ready for your panel yet." : `${scored} of ${teams.length} scored.`}
        </p>
      </div>

      {teams.length > 0 && (
        <ul className="divide-y divide-divider border border-divider">
          {teams.map((t) => {
            const ev = t.submission?.evaluations[0];
            const status = !ev ? "todo" : ev.adminUnlockedAt ? "unlocked" : ev.locked ? "done" : "todo";
            return (
              <li key={t.id}>
                <Link
                  href={`/jury/${t.id}`}
                  className="flex min-h-16 flex-wrap items-center gap-x-6 gap-y-2 bg-charcoal px-4 py-3 transition-colors hover:bg-charcoal-2 sm:px-5"
                >
                  <span className="font-mono text-sm text-cream/70">{t.code}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-cream">{t.name}</span>
                    <span className="block text-sm text-cream/55">
                      {t.submission?.title} · SDG {t.submission?.sdg}
                    </span>
                  </span>
                  {status === "done" && <StatusBadge tone="ok">Submitted</StatusBadge>}
                  {status === "todo" && <StatusBadge tone="pending">Not yet scored</StatusBadge>}
                  {status === "unlocked" && <StatusBadge tone="bad">Unlocked for correction</StatusBadge>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
