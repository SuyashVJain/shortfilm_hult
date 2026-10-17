import Link from "next/link";
import { StatBlock } from "@/components/ui";
import { overviewStats } from "@/lib/admin-data";
import { AccountPasswordChange } from "@/components/auth/AccountPasswordChange";
import { requireRole } from "@/lib/guards";
import { hasPassword } from "@/lib/passwords";

export default async function AdminOverviewPage() {
  const { user } = await requireRole("ADMIN");
  const [s, passwordSet] = await Promise.all([overviewStats(), hasPassword(user.id)]);

  return (
    <>
      <h1 className="font-display text-4xl uppercase text-cream">Overview</h1>

      <Link
        href="/admin/payments"
        className="mt-6 flex min-h-14 items-center justify-between gap-4 border border-red/60 bg-charcoal px-5 py-4 transition-colors hover:bg-charcoal-2"
      >
        <span className="text-cream">
          <span className="font-semibold">{s.toReview}</span> {s.toReview === 1 ? "payment needs" : "payments need"} review
        </span>
        <span className="text-xs uppercase tracking-[0.2em] text-red">Open review queue →</span>
      </Link>

      <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
        <StatBlock value={s.totalTeams} label="Total teams" />
        <StatBlock value={s.toReview} label="Payments to review" />
        <StatBlock value={s.verified} label="Verified" />
        <StatBlock value={s.rejected} label="Rejected" />
        <StatBlock value={s.filmsSubmitted} label="Films submitted" />
        <StatBlock value={s.evaluations} label="Evaluations completed" />
      </div>
      <p className="mt-6 text-xs text-cream/45">Payment counts use each team&rsquo;s latest payment.</p>

      {passwordSet && (
        <section className="mt-14 border-t border-divider pt-6">
          <h2 className="mb-4 text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">Your account</h2>
          <AccountPasswordChange />
        </section>
      )}
    </>
  );
}
