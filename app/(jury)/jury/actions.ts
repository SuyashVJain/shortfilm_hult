"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { endJurySession, requireJury, startJurySession, verifyPassword } from "@/lib/jury-auth";
import { rateLimit } from "@/lib/rate-limit";
import { evaluationSchema, scaleFrom } from "@/lib/scoring";
import { getSettings } from "@/lib/settings";

export type LoginResult = { ok: false; error: string };

const loginSchema = z.object({
  username: z.string().trim().toLowerCase().min(1, "Please enter your jury ID.").max(64),
  password: z.string().min(1, "Please enter your password.").max(200),
});

const BAD_LOGIN = "That jury ID and password don't match an active account.";

/** Username + password sign-in. On success sets the jury cookie and goes to /jury. */
export async function juryLogin(input: { username: string; password: string }): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { username, password } = parsed.data;

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`jury-login:${username}`, 10, 10 * 60 * 1000) || !rateLimit(`jury-login-ip:${ip}`, 30, 10 * 60 * 1000)) {
    return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const account = await db.juryAccount.findUnique({ where: { username }, select: { id: true, passwordHash: true, active: true } });
  // Same message for unknown user, wrong password or inactive account.
  if (!account || !account.active || !(await verifyPassword(password, account.passwordHash))) {
    return { ok: false, error: BAD_LOGIN };
  }
  await startJurySession(account.id);
  redirect("/jury");
}

export async function juryLogout() {
  await endJurySession();
  redirect("/jury/login");
}

export type EvaluationResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Final scores for one team. Re-checks everything server-side: the team is in
 * this juror's location, its film is APPROVED, and there is no locked
 * evaluation already (unless an admin unlocked it for correction).
 */
export async function submitEvaluation(teamId: string, scores: Record<string, unknown>, comment?: string): Promise<EvaluationResult> {
  const juror = await requireJury();
  const id = z.string().trim().min(1).max(64).safeParse(teamId);
  if (!id.success) return { ok: false, error: "That team could not be found." };

  const team = await db.team.findFirst({
    where: { id: id.data, locationId: juror.locationId },
    select: { submission: { select: { id: true, status: true } } },
  });
  if (!team?.submission) return { ok: false, error: "That team isn't in your queue." };
  if (team.submission.status !== "APPROVED") return { ok: false, error: "This film isn't ready for judging." };

  const existing = await db.evaluation.findUnique({
    where: { submissionId_juryAccountId: { submissionId: team.submission.id, juryAccountId: juror.id } },
    select: { locked: true, adminUnlockedAt: true },
  });
  if (existing?.locked && !existing.adminUnlockedAt) {
    return { ok: false, error: "You've already submitted final scores for this team." };
  }

  const settings = await getSettings();
  const parsed = evaluationSchema(settings.evaluationCriteria, scaleFrom(settings.scoringScale)).safeParse({ scores, comment });
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message]));
    return { ok: false, error: "Please check the scores and try again.", fieldErrors };
  }

  const data = {
    scores: parsed.data.scores,
    comment: parsed.data.comment || null,
    locked: true,
    lockedAt: new Date(),
    adminUnlockedAt: null,
  };
  await db.evaluation.upsert({
    where: { submissionId_juryAccountId: { submissionId: team.submission.id, juryAccountId: juror.id } },
    create: { submissionId: team.submission.id, juryAccountId: juror.id, ...data },
    update: data,
  });

  revalidatePath("/jury");
  revalidatePath(`/jury/${id.data}`);
  revalidatePath("/admin", "layout");
  return { ok: true };
}
