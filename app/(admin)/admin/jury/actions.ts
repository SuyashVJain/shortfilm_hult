"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { requireRole } from "@/lib/guards";
import { hashPassword } from "@/lib/jury-auth";

export type JuryAdminResult = { ok: true; message: string } | { ok: false; error: string };

const id = z.string().trim().min(1).max(64);

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/jury", "layout");
}

export async function createLocation(name: string): Promise<JuryAdminResult> {
  await requireRole("ADMIN");
  const parsed = z.string().trim().min(2, "Location name must be at least 2 characters.").max(60).safeParse(name);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    await db.location.create({ data: { name: parsed.data } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return { ok: false, error: "A location with that name already exists." };
    throw err;
  }
  refresh();
  return { ok: true, message: `Location "${parsed.data}" created.` };
}

const accountSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._-]{3,32}$/, "Jury ID: 3–32 characters, letters, numbers, dot, dash or underscore."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(200),
  displayName: z.string().trim().min(2, "Please enter the juror's name.").max(80),
  locationId: id,
});

/** Creates a jury account. The password is hashed and never stored or returned in plain text. */
export async function createJuryAccount(input: z.input<typeof accountSchema>): Promise<JuryAdminResult> {
  await requireRole("ADMIN");
  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { username, password, displayName, locationId } = parsed.data;
  if (!(await db.location.findUnique({ where: { id: locationId }, select: { id: true } }))) {
    return { ok: false, error: "Please choose a location." };
  }
  try {
    await db.juryAccount.create({ data: { username, passwordHash: await hashPassword(password), displayName, locationId } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return { ok: false, error: "That jury ID is already taken." };
    throw err;
  }
  refresh();
  return { ok: true, message: `Jury account "${username}" created.` };
}

/** Deactivate (signs the juror out everywhere) or reactivate an account. */
export async function setJuryActive(accountId: string, active: boolean): Promise<JuryAdminResult> {
  await requireRole("ADMIN");
  const parsed = id.safeParse(accountId);
  if (!parsed.success || typeof active !== "boolean") return { ok: false, error: "That account could not be found." };
  const { count } = await db.juryAccount.updateMany({ where: { id: parsed.data }, data: { active } });
  if (count === 0) return { ok: false, error: "That account could not be found." };
  if (!active) await db.jurySession.deleteMany({ where: { juryAccountId: parsed.data } });
  refresh();
  return { ok: true, message: active ? "Account reactivated." : "Account deactivated and signed out." };
}

/** Assign a team to a judging location, or clear it with an empty id. */
export async function assignTeamLocation(teamId: string, locationId: string): Promise<JuryAdminResult> {
  await requireRole("ADMIN");
  const t = id.safeParse(teamId);
  if (!t.success) return { ok: false, error: "That team could not be found." };
  let loc: string | null = null;
  if (locationId) {
    const l = id.safeParse(locationId);
    if (!l.success || !(await db.location.findUnique({ where: { id: l.data }, select: { id: true } }))) {
      return { ok: false, error: "That location could not be found." };
    }
    loc = l.data;
  }
  const { count } = await db.team.updateMany({ where: { id: t.data }, data: { locationId: loc } });
  if (count === 0) return { ok: false, error: "That team could not be found." };
  refresh();
  return { ok: true, message: loc ? "Team assigned." : "Team unassigned." };
}

/** Make ONE locked evaluation editable again until the juror resubmits it. */
export async function unlockEvaluation(evaluationId: string): Promise<JuryAdminResult> {
  await requireRole("ADMIN");
  const parsed = id.safeParse(evaluationId);
  if (!parsed.success) return { ok: false, error: "That evaluation could not be found." };
  const { count } = await db.evaluation.updateMany({
    where: { id: parsed.data, locked: true, adminUnlockedAt: null },
    data: { adminUnlockedAt: new Date() },
  });
  if (count === 0) return { ok: false, error: "That evaluation is already unlocked or could not be found." };
  refresh();
  return { ok: true, message: "Unlocked. The juror can correct and resubmit it." };
}
