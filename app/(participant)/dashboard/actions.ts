"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/guards";
import { isOwnScreenshotUrl } from "@/lib/payment-screenshots";
import { getSetting } from "@/lib/settings";
import { fieldErrors, paymentSchema } from "@/lib/validation";

export type ResubmitResult = { ok: true } | { ok: false; fieldErrors?: Record<string, string>; formError?: string };

/** New PENDING payment after a rejection. Old rows stay as history. */
export async function resubmitPayment(input: { utr: string; screenshotUrl: string }): Promise<ResubmitResult> {
  const { user } = await requireRole("PARTICIPANT");

  // Scoped to the signed-in leader's own team.
  const team = await db.team.findUnique({
    where: { leaderId: user.id },
    select: { id: true, locked: true, payments: { orderBy: { submittedAt: "desc" }, take: 1, select: { status: true } } },
  });
  if (!team) return { ok: false, formError: "We couldn't find your team." };
  if (team.locked) return { ok: false, formError: "Your registration is locked. Please contact the organisers." };
  if (team.payments[0]?.status !== "REJECTED") {
    return { ok: false, formError: "Your payment doesn't need resubmitting." };
  }

  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  if (!isOwnScreenshotUrl(parsed.data.screenshotUrl, user.id)) {
    return { ok: false, fieldErrors: { screenshotUrl: "Please upload your payment screenshot again." } };
  }

  await db.payment.create({
    data: {
      teamId: team.id,
      amount: await getSetting("registrationFee"), // from settings, never the client
      utr: parsed.data.utr,
      screenshotUrl: parsed.data.screenshotUrl,
      status: "PENDING",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin", "layout");
  return { ok: true };
}
