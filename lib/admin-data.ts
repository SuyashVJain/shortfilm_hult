import "server-only";
import { db } from "@/lib/db";
import type { PaymentStatusValue } from "@/lib/payment-status";

// Admin read models. Callers must have already passed requireRole("ADMIN").

export type TeamRow = {
  id: string;
  code: string;
  name: string;
  leaderName: string;
  leaderEmail: string;
  whatsapp: string;
  sdg: number | null; // chosen at film submission; null until then
  size: number;
  latestPayment: PaymentStatusValue | null;
  filmStatus: string | null;
  createdAt: Date;
};

/** Every team with its latest payment status. Small event scale: one query, derived in memory. */
export async function listTeams(): Promise<TeamRow[]> {
  const teams = await db.team.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      name: true,
      leaderName: true,
      whatsapp: true,
      sdg: true,
      createdAt: true,
      leader: { select: { email: true } },
      _count: { select: { members: true } },
      payments: { orderBy: { submittedAt: "desc" }, take: 1, select: { status: true } },
      submission: { select: { status: true, sdg: true } },
    },
  });
  return teams.map((t) => ({
    id: t.id,
    code: t.code,
    name: t.name,
    leaderName: t.leaderName,
    leaderEmail: t.leader.email,
    whatsapp: t.whatsapp,
    // Film content lives on FilmSubmission; Team.sdg is a legacy fallback.
    sdg: t.submission?.sdg ?? t.sdg,
    size: t._count.members,
    latestPayment: t.payments[0]?.status ?? null,
    filmStatus: t.submission?.status ?? null,
    createdAt: t.createdAt,
  }));
}

export async function overviewStats() {
  const [teams, filmsSubmitted, evaluations] = await Promise.all([
    listTeams(),
    db.filmSubmission.count({ where: { status: { not: "NOT_SUBMITTED" } } }),
    db.evaluation.count(),
  ]);
  const byStatus = (s: PaymentStatusValue) => teams.filter((t) => t.latestPayment === s).length;
  return {
    totalTeams: teams.length,
    toReview: byStatus("PENDING"),
    verified: byStatus("VERIFIED"),
    rejected: byStatus("REJECTED"),
    filmsSubmitted,
    evaluations,
  };
}

/** Queue items: payments that are the latest for their team, in the given status. */
export async function listPayments(status: PaymentStatusValue) {
  const payments = await db.payment.findMany({
    where: { status },
    orderBy: { submittedAt: status === "PENDING" ? "asc" : "desc" },
    select: {
      id: true,
      utr: true,
      amount: true,
      status: true,
      rejectReason: true,
      screenshotUrl: true,
      submittedAt: true,
      reviewedAt: true,
      team: { select: { id: true, code: true, name: true } },
    },
  });
  return payments.map((p) => ({ ...p, submittedAt: p.submittedAt.toISOString(), reviewedAt: p.reviewedAt?.toISOString() ?? null }));
}

export type QueueItem = Awaited<ReturnType<typeof listPayments>>[number];
