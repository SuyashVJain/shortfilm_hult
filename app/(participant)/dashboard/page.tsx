// PLACEHOLDER: temporary participant dashboard (Phase 2 builds the real one).
import Link from "next/link";
import { ResubmitPayment } from "@/components/dashboard/ResubmitPayment";
import { RolePlaceholder } from "@/components/site/RolePlaceholder";
import { Container, StatusBadge } from "@/components/ui";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/guards";
import { PAYMENT_LABEL, PAYMENT_TONE } from "@/lib/payment-status";
import { getSetting } from "@/lib/settings";

export default async function DashboardPage() {
  const { user, role } = await requireRole("PARTICIPANT");

  // Scoped to the signed-in leader only.
  const team = await db.team.findUnique({
    where: { leaderId: user.id },
    select: {
      name: true,
      code: true,
      sdg: true,
      locked: true,
      payments: { orderBy: { submittedAt: "desc" }, take: 1, select: { status: true, rejectReason: true } },
    },
  });
  const latest = team?.payments[0];
  const canResubmit = latest?.status === "REJECTED" && !team?.locked;

  return (
    <>
      <RolePlaceholder area="Dashboard" email={user.email} role={role} />
      <Container className="mt-[-6dvh] pb-[12dvh]">
        {team ? (
          <>
            <dl className="grid max-w-md grid-cols-[auto_1fr] items-center gap-x-8 gap-y-3 border-t border-divider pt-8 text-sm">
              <dt className="uppercase tracking-[0.24em] text-cream-muted">Team</dt>
              <dd className="text-cream">{team.name}</dd>
              <dt className="uppercase tracking-[0.24em] text-cream-muted">Team ID</dt>
              <dd className="text-cream">{team.code}</dd>
              <dt className="uppercase tracking-[0.24em] text-cream-muted">Payment</dt>
              <dd>
                {latest ? <StatusBadge tone={PAYMENT_TONE[latest.status]}>{PAYMENT_LABEL[latest.status]}</StatusBadge> : "Not submitted"}
              </dd>
              <dt className="uppercase tracking-[0.24em] text-cream-muted">SDG</dt>
              <dd className="text-cream">{team.sdg != null ? `SDG ${team.sdg}` : "Not yet chosen"}</dd>
            </dl>

            {latest?.status === "REJECTED" && (
              <section className="mt-10 max-w-xl border-l-2 border-red bg-charcoal/80 px-5 py-5">
                <h2 className="text-[0.7rem] uppercase tracking-[0.24em] text-red">Payment rejected</h2>
                {latest.rejectReason && <p className="mt-2 text-cream">Reason: {latest.rejectReason}</p>}
                {canResubmit ? (
                  <ResubmitPayment fee={await getSetting("registrationFee")} />
                ) : (
                  <p className="mt-3 text-sm text-cream/70">Your registration is locked. Please contact the organisers.</p>
                )}
              </section>
            )}
          </>
        ) : (
          <p className="border-t border-divider pt-8 text-sm text-cream/70">
            No team yet.{" "}
            <Link href="/register" className="text-cream underline underline-offset-4">
              Register your team
            </Link>
          </p>
        )}
      </Container>
    </>
  );
}
