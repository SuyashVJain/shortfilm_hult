"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { requireRole } from "@/lib/guards";
import type { SettingKey } from "@/lib/settings-defaults";

export type SettingsResult = { ok: true; message: string } | { ok: false; error: string };

/** Pages that read settings; refreshed after every save. */
const READERS = ["/", "/competition", "/sdgs", "/guidelines", "/register", "/dashboard", "/admin/settings"];

async function write(values: Partial<Record<SettingKey, Prisma.InputJsonValue>>, userId: string) {
  await db.$transaction(
    Object.entries(values).map(([key, value]) =>
      db.eventSetting.upsert({
        where: { key },
        create: { key, value: value as Prisma.InputJsonValue, updatedById: userId },
        update: { value: value as Prisma.InputJsonValue, updatedById: userId },
      }),
    ),
  );
  for (const p of READERS) revalidatePath(p);
  revalidatePath("/admin", "layout");
}

function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the values and try again.";
}

const wholeNumber = (label: string, min: number) =>
  z.coerce
    .number({ error: `${label} must be a number.` })
    .int(`${label} must be a whole number.`)
    .min(min, `${label} must be ${min} or more.`);

// ---------------------------------------------------------------------------

const registrationSchema = z.object({
  // From <input type="datetime-local">, interpreted as India time (IST, +05:30).
  deadlineLocal: z
    .string()
    // Seconds are kept (the default deadline is 23:59:59); browsers may omit ":00".
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/, "Please pick a valid date and time for the deadline.")
    .transform((v) => (v.length === 16 ? `${v}:00` : v))
    .refine((v) => !Number.isNaN(new Date(`${v}+05:30`).getTime()), "Please pick a valid date and time for the deadline."),
  registrationOpen: z.boolean(),
  registrationFee: wholeNumber("Registration fee", 0),
});

export async function saveRegistration(input: z.input<typeof registrationSchema>): Promise<SettingsResult> {
  const { user } = await requireRole("ADMIN");
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const { deadlineLocal, registrationOpen, registrationFee } = parsed.data;
  await write(
    { registrationDeadline: `${deadlineLocal}+05:30`, registrationOpen, registrationFee },
    user.id,
  );
  return { ok: true, message: "Registration settings saved." };
}

const teamSizeSchema = z
  .object({ minTeamSize: wholeNumber("Minimum team size", 1), maxTeamSize: wholeNumber("Maximum team size", 1) })
  .refine((v) => v.minTeamSize < v.maxTeamSize, "Minimum team size must be smaller than the maximum.");

export async function saveTeamSize(input: z.input<typeof teamSizeSchema>): Promise<SettingsResult> {
  const { user } = await requireRole("ADMIN");
  const parsed = teamSizeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  await write({ minTeamSize: parsed.data.minTeamSize, maxTeamSize: parsed.data.maxTeamSize }, user.id);
  return { ok: true, message: "Team size saved." };
}

const filmSchema = z.object({
  maxFilmDurationMinutes: z.coerce
    .number({ error: "Maximum film duration must be a number." })
    .min(0, "Maximum film duration must be 0 or more."),
  submissionOpen: z.boolean(),
});

export async function saveFilm(input: z.input<typeof filmSchema>): Promise<SettingsResult> {
  const { user } = await requireRole("ADMIN");
  const parsed = filmSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  await write(parsed.data, user.id);
  return { ok: true, message: "Film settings saved." };
}

const paymentSchema = z.object({
  text: z.string().trim().max(2000, "Payment instructions must be 2000 characters or fewer."),
  // A site path like /pay/qr.jpg or an https URL; empty means no QR.
  qrImageUrl: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || (/^\/[\w\-./]+$/.test(v) && !v.includes("..")) || /^https:\/\/\S+$/.test(v),
      "QR image must be a site path starting with / (for example /pay/qr.jpg) or an https link.",
    ),
});

export async function savePaymentInstructions(input: z.input<typeof paymentSchema>): Promise<SettingsResult> {
  const { user } = await requireRole("ADMIN");
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  await write(
    { paymentInstructions: { text: parsed.data.text, qrImageUrl: parsed.data.qrImageUrl || null } },
    user.id,
  );
  return { ok: true, message: "Payment instructions saved." };
}

const prizeSchema = z.object({
  prizeText: z
    .string()
    .trim()
    .min(1, "Prize text can't be empty.")
    .max(80, "Prize text must be 80 characters or fewer.")
    // Never display a prize amount (event-facts §2).
    .refine((v) => !/(₹|\brs\.?\s*\d|\binr\b|\d)/i.test(v), "Prize text must not include an amount or numbers."),
});

export async function savePrizeText(input: z.input<typeof prizeSchema>): Promise<SettingsResult> {
  const { user } = await requireRole("ADMIN");
  const parsed = prizeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  await write({ prizeText: parsed.data.prizeText }, user.id);
  return { ok: true, message: "Prize text saved." };
}
