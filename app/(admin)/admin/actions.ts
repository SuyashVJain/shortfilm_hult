"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/guards";
import { paymentRejectedEmail, paymentVerifiedEmail, type Email } from "@/lib/email-templates";
import { sendMail } from "@/lib/mailer";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const idSchema = z.string().trim().min(1).max(64);
const reasonSchema = z
  .string()
  .trim()
  .min(5, "Please give a reason of at least 5 characters.")
  .max(500, "Please keep the reason under 500 characters.");

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard");
}

async function notify(to: string, message: Email) {
  try {
    await sendMail({ to, ...message });
  } catch {
    console.warn("admin: payment email not sent");
  }
}

/** Only a PENDING payment can be reviewed. Idempotent: a second click just reports it. */
async function review(paymentId: string, data: { status: "VERIFIED" | "REJECTED"; rejectReason?: string }): Promise<ActionResult> {
  const { user } = await requireRole("ADMIN");
  const id = idSchema.safeParse(paymentId);
  if (!id.success) return { ok: false, error: "That payment could not be found." };

  const { count } = await db.payment.updateMany({
    where: { id: id.data, status: "PENDING" },
    data: { ...data, reviewedAt: new Date(), reviewedById: user.id },
  });
  if (count === 0) {
    const exists = await db.payment.findUnique({ where: { id: id.data }, select: { status: true } });
    return exists
      ? { ok: false, error: "This payment has already been reviewed." }
      : { ok: false, error: "That payment could not be found." };
  }
  refresh();

  const payment = await db.payment.findUnique({
    where: { id: id.data },
    select: { team: { select: { code: true, name: true, leader: { select: { email: true } } } } },
  });
  if (payment) {
    const { code, name, leader } = payment.team;
    if (data.status === "VERIFIED") {
      await notify(leader.email, paymentVerifiedEmail({ teamName: name, teamCode: code }));
    } else {
      await notify(leader.email, paymentRejectedEmail({ teamName: name, teamCode: code, reason: data.rejectReason ?? "" }));
    }
  }
  return { ok: true };
}

export async function verifyPayment(paymentId: string): Promise<ActionResult> {
  return review(paymentId, { status: "VERIFIED" });
}

export async function rejectPayment(paymentId: string, reason: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = reasonSchema.safeParse(reason);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  return review(paymentId, { status: "REJECTED", rejectReason: parsed.data });
}

export async function setTeamLocked(teamId: string, locked: boolean): Promise<ActionResult> {
  await requireRole("ADMIN");
  const id = idSchema.safeParse(teamId);
  if (!id.success || typeof locked !== "boolean") return { ok: false, error: "That team could not be found." };
  const { count } = await db.team.updateMany({ where: { id: id.data }, data: { locked } });
  if (count === 0) return { ok: false, error: "That team could not be found." };
  refresh();
  return { ok: true, message: locked ? "Editing locked." : "Editing unlocked." };
}

const FILM_STATUSES = ["UNDER_REVIEW", "APPROVED", "REJECTED"] as const;

/**
 * Admin review of a film submission. REJECTED requires a note (shown to the
 * team as the reason, and it can then resubmit). No email is sent.
 */
export async function setFilmStatus(
  submissionId: string,
  status: (typeof FILM_STATUSES)[number],
  note?: string,
): Promise<ActionResult> {
  await requireRole("ADMIN");
  const id = idSchema.safeParse(submissionId);
  if (!id.success || !FILM_STATUSES.includes(status)) return { ok: false, error: "That submission could not be found." };
  let adminNote: string | undefined;
  if (status === "REJECTED") {
    const parsed = reasonSchema.safeParse(note ?? "");
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    adminNote = parsed.data;
  }
  const { count } = await db.filmSubmission.updateMany({
    where: { id: id.data, status: { not: "NOT_SUBMITTED" } },
    data: { status, ...(adminNote !== undefined ? { adminNote } : {}) },
  });
  if (count === 0) return { ok: false, error: "That submission could not be found." };
  refresh();
  return { ok: true, message: status === "APPROVED" ? "Film approved." : status === "REJECTED" ? "Film rejected." : "Marked under review." };
}
