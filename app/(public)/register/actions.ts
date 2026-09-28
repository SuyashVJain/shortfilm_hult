"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { requireRole } from "@/lib/guards";
import { sendMail } from "@/lib/mailer";
import { isOwnScreenshotUrl } from "@/lib/payment-screenshots";
import { getSettings, isRegistrationOpen } from "@/lib/settings";
import { nextTeamCode } from "@/lib/team-code";
import { fieldErrors, registrationSchema, teamNameKey, type RegistrationInput } from "@/lib/validation";

/** Step index each payload section belongs to (matches RegisterFlow). */
const STEP_OF = { details: 1, members: 2, film: 3, payment: 4 } as const;

export type RegisterResult =
  | { ok: true; teamCode: string; sdg: number; filmTitle: string; emailSent: boolean }
  | { ok: false; step?: number; fieldErrors?: Record<string, string>; formError?: string };

function stepFor(errors: Record<string, string>) {
  const first = Object.keys(errors)[0]?.split(".")[0] as keyof typeof STEP_OF | undefined;
  return first ? STEP_OF[first] : undefined;
}

export async function registerTeam(input: RegistrationInput): Promise<RegisterResult> {
  const { user } = await requireRole("PARTICIPANT");

  if (!(await isRegistrationOpen())) {
    return { ok: false, formError: "Registration is closed. Your details were not submitted." };
  }

  // One team per leader: an existing team (e.g. a double submit) goes to the dashboard.
  if (await db.team.findUnique({ where: { leaderId: user.id }, select: { id: true } })) redirect("/dashboard");

  const settings = await getSettings();
  const parsed = registrationSchema({
    minTeamSize: settings.minTeamSize,
    maxTeamSize: settings.maxTeamSize,
    sdgNumbers: settings.sdgThemes.map((t) => t.number),
  }).safeParse(input);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    return { ok: false, step: stepFor(errors), fieldErrors: errors };
  }
  const { details, members, film, payment } = parsed.data;

  if (!isOwnScreenshotUrl(payment.screenshotUrl, user.id)) {
    return {
      ok: false,
      step: STEP_OF.payment,
      fieldErrors: { "payment.screenshotUrl": "Please upload your payment screenshot again." },
    };
  }

  const nameKey = teamNameKey(details.teamName);
  const nameTaken = { ok: false as const, step: STEP_OF.details, fieldErrors: { "details.teamName": "That team name is already taken. Please choose another." } };
  if (await db.team.findUnique({ where: { nameKey }, select: { id: true } })) return nameTaken;

  let teamCode: string;
  try {
    teamCode = await db.$transaction(async (tx) => {
      const code = await nextTeamCode(tx);
      await tx.team.create({
        data: {
          code,
          name: details.teamName.trim(),
          nameKey,
          leaderId: user.id,
          leaderName: details.leaderName,
          whatsapp: details.whatsapp,
          branch: details.branch,
          semester: details.semester,
          sdg: film.sdg,
          filmTitle: film.filmTitle,
          synopsis: film.synopsis,
          sdgApproach: film.sdgApproach,
          registrationStatus: "SUBMITTED",
          locked: false,
          members: {
            create: [
              { fullName: details.leaderName, branch: details.branch, semester: details.semester, isLeader: true },
              ...members.map((m) => ({ ...m, isLeader: false })),
            ],
          },
          payments: {
            create: {
              // The fee comes from settings, never from the client.
              amount: settings.registrationFee,
              utr: payment.utr,
              screenshotUrl: payment.screenshotUrl,
              status: "PENDING",
            },
          },
        },
      });
      return code;
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      // A unique clash: work out which one without trusting the error shape.
      if (await db.team.findUnique({ where: { leaderId: user.id }, select: { id: true } })) redirect("/dashboard");
      if (await db.team.findUnique({ where: { nameKey }, select: { id: true } })) return nameTaken;
    }
    console.warn("registerTeam: transaction failed");
    return { ok: false, formError: "We couldn't save your registration. Please try again." };
  }

  let emailSent = true;
  try {
    await sendMail({
      to: user.email,
      subject: `Registration received: ${teamCode}`,
      text:
        `Your team "${details.teamName.trim()}" is registered for the ${settings.eventTitle}.\n\n` +
        `Team ID: ${teamCode}\nPayment: Pending verification\n\n` +
        `The organisers will verify your payment manually. You can follow the status on your dashboard.`,
    });
  } catch {
    emailSent = false;
    console.warn("registerTeam: confirmation email not sent");
  }

  return { ok: true, teamCode, sdg: film.sdg, filmTitle: film.filmTitle, emailSent };
}
