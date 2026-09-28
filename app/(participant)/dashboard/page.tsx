// PLACEHOLDER: temporary participant dashboard (Phase 2 builds the real one).
import Link from "next/link";
import { RolePlaceholder } from "@/components/site/RolePlaceholder";
import { Container } from "@/components/ui";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/guards";

const PAYMENT_LABEL = { PENDING: "Pending verification", VERIFIED: "Verified", REJECTED: "Rejected" } as const;

export default async function DashboardPage() {
  const { user, role } = await requireRole("PARTICIPANT");

  // Scoped to the signed-in leader only.
  const team = await db.team.findUnique({
    where: { leaderId: user.id },
    select: {
      name: true,
      code: true,
      sdg: true,
      payments: { orderBy: { submittedAt: "desc" }, take: 1, select: { status: true } },
    },
  });

  return (
    <>
      <RolePlaceholder area="Dashboard" email={user.email} role={role} />
      <Container className="mt-[-6dvh] pb-[12dvh]">
        {team ? (
          <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-8 gap-y-3 border-t border-divider pt-8 text-sm">
            <dt className="uppercase tracking-[0.24em] text-cream-muted">Team</dt>
            <dd className="text-cream">{team.name}</dd>
            <dt className="uppercase tracking-[0.24em] text-cream-muted">Team ID</dt>
            <dd className="text-cream">{team.code}</dd>
            <dt className="uppercase tracking-[0.24em] text-cream-muted">Payment</dt>
            <dd className="text-cream">{team.payments[0] ? PAYMENT_LABEL[team.payments[0].status] : "Not submitted"}</dd>
            <dt className="uppercase tracking-[0.24em] text-cream-muted">SDG</dt>
            <dd className="text-cream">SDG {team.sdg}</dd>
          </dl>
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
