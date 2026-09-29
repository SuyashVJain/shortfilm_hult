"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/guards";
import { isOwnScreenshotUrl } from "@/lib/payment-screenshots";
import { Prisma } from "@/lib/generated/prisma/client";
import { getSetting, getSettings } from "@/lib/settings";
import { fieldErrors, paymentSchema, teamEditSchema, teamNameKey } from "@/lib/validation";

const LOCKED = "Editing is locked by the organisers. Contact them if you need changes.";

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

export type UpdateTeamResult = { ok: true } | { ok: false; fieldErrors?: Record<string, string>; formError?: string };

/** Loose input: dropdown values are plain strings until validated here. */
type UpdateTeamInput = {
  details: { teamName: string; leaderName: string; enrollmentNumber: string; whatsapp: string; branch: string; semester: string };
  members: { fullName: string; enrollmentNumber: string; branch: string; semester: string }[];
};

/**
 * Edit team details and members. Only the signed-in leader's own team, only
 * while not locked. Payment and SDG/film fields are never touched here.
 */
export async function updateTeam(input: UpdateTeamInput): Promise<UpdateTeamResult> {
  const { user } = await requireRole("PARTICIPANT");

  const team = await db.team.findUnique({ where: { leaderId: user.id }, select: { id: true, locked: true } });
  if (!team) return { ok: false, formError: "We couldn't find your team." };
  if (team.locked) return { ok: false, formError: LOCKED };

  const settings = await getSettings();
  const parsed = teamEditSchema({ minTeamSize: settings.minTeamSize, maxTeamSize: settings.maxTeamSize }).safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const { details, members } = parsed.data;

  const nameKey = teamNameKey(details.teamName);
  const nameTaken = { ok: false as const, fieldErrors: { "details.teamName": "That team name is already taken. Please choose another." } };
  const clash = await db.team.findUnique({ where: { nameKey }, select: { id: true } });
  if (clash && clash.id !== team.id) return nameTaken;

  try {
    await db.$transaction(async (tx) => {
      // Conditional update: fails if an admin locked the team mid-edit.
      const { count } = await tx.team.updateMany({
        where: { id: team.id, leaderId: user.id, locked: false },
        data: {
          name: details.teamName.trim(),
          nameKey,
          leaderName: details.leaderName,
          whatsapp: details.whatsapp,
          branch: details.branch,
          semester: details.semester,
        },
      });
      if (count === 0) throw new Error(LOCKED);
      await tx.teamMember.deleteMany({ where: { teamId: team.id } });
      await tx.teamMember.createMany({
        data: [
          {
            teamId: team.id,
            fullName: details.leaderName,
            enrollmentNumber: details.enrollmentNumber,
            branch: details.branch,
            semester: details.semester,
            isLeader: true,
          },
          ...members.map((m) => ({ ...m, teamId: team.id, isLeader: false })),
        ],
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === LOCKED) return { ok: false, formError: LOCKED };
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return nameTaken;
    console.warn("updateTeam: transaction failed");
    return { ok: false, formError: "We couldn't save your changes. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin", "layout");
  return { ok: true };
}
