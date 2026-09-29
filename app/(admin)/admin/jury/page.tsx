import Link from "next/link";
import { JuryActiveToggle, NewJuryAccountForm, NewLocationForm, TeamLocationSelect } from "@/components/admin/JuryAdmin";
import { StatusBadge } from "@/components/ui";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/guards";
import { SUBMISSION_LABEL } from "@/lib/payment-status";

export default async function AdminJuryPage() {
  await requireRole("ADMIN");

  const [locations, accounts, teams] = await Promise.all([
    db.location.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, _count: { select: { teams: true, juryAccounts: true } } } }),
    // Never select passwordHash here.
    db.juryAccount.findMany({
      orderBy: [{ active: "desc" }, { username: "asc" }],
      select: { id: true, username: true, displayName: true, active: true, location: { select: { name: true } }, _count: { select: { evaluations: true } } },
    }),
    db.team.findMany({
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true, locationId: true, submission: { select: { status: true } } },
    }),
  ]);
  const locOptions = locations.map((l) => ({ id: l.id, name: l.name }));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl uppercase text-cream">Jury</h1>
        <p className="mt-2 max-w-prose text-sm text-cream/60">
          Jurors sign in at <span className="font-mono text-cream/80">/jury/login</span> with the ID and password you set here, and see
          only approved films from teams assigned to their location.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <NewLocationForm />
        <NewJuryAccountForm locations={locOptions} />
      </div>

      <section>
        <h2 className="mb-3 text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">Locations</h2>
        {locations.length === 0 ? (
          <p className="text-sm text-cream/60">No locations yet.</p>
        ) : (
          <ul className="divide-y divide-divider border border-divider">
            {locations.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 bg-charcoal px-4 py-3 text-sm">
                <span className="text-cream">{l.name}</span>
                <span className="text-cream/55">
                  {l._count.teams} {l._count.teams === 1 ? "team" : "teams"} · {l._count.juryAccounts} {l._count.juryAccounts === 1 ? "juror" : "jurors"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">Jury accounts</h2>
        {accounts.length === 0 ? (
          <p className="text-sm text-cream/60">No jury accounts yet.</p>
        ) : (
          <ul className="divide-y divide-divider border border-divider">
            {accounts.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-charcoal px-4 py-3 text-sm">
                <span className="font-mono text-cream">{a.username}</span>
                <span className="text-cream/80">{a.displayName}</span>
                <span className="text-cream/55">{a.location.name}</span>
                <span className="text-cream/55">{a._count.evaluations} scored</span>
                <StatusBadge tone={a.active ? "ok" : "neutral"}>{a.active ? "Active" : "Deactivated"}</StatusBadge>
                <span className="ml-auto">
                  <JuryActiveToggle id={a.id} active={a.active} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">Assign teams to locations</h2>
        {teams.length === 0 ? (
          <p className="text-sm text-cream/60">No teams yet.</p>
        ) : (
          <ul className="divide-y divide-divider border border-divider">
            {teams.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-charcoal px-4 py-3 text-sm">
                <Link href={`/admin/teams/${t.id}`} className="font-mono text-cream hover:underline">
                  {t.code}
                </Link>
                <span className="text-cream/80">{t.name}</span>
                <span className="text-cream/55">Film: {SUBMISSION_LABEL[t.submission?.status ?? "NOT_SUBMITTED"]}</span>
                <span className="ml-auto">
                  <TeamLocationSelect teamId={t.id} locationId={t.locationId ?? ""} locations={locOptions} />
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-cream/50">Jurors only see a team once its film is Approved.</p>
      </section>
    </div>
  );
}
