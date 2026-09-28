import { z } from "zod";

/** Trimmed, required text with a friendly message. */
export const requiredText = (label: string, max = 120) =>
  z
    .string({ error: `Please enter ${label}.` })
    .trim()
    .min(1, `Please enter ${label}.`)
    .max(max, `${capitalise(label)} must be ${max} characters or fewer.`);

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Indian mobile number, with or without +91 / 0, spaces or dashes. Normalised to +91XXXXXXXXXX. */
export const whatsappSchema = z
  .string({ error: "Please enter a WhatsApp number." })
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(
    z
      .string()
      .regex(/^(?:\+91|91|0)?[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number.")
      .transform((v) => `+91${v.slice(-10)}`),
  );

// Branch and semester options (owner decision). Order is the display order.
export const BRANCHES = [
  "B.Tech CSIT",
  "B.Tech AI/ML",
  "B.Tech SAR",
  "BBA RM",
  "BBA DMM",
  "BBA LSCM",
  "BBA BFSI",
  "B.Sc Data Science",
  "MBA BFSI",
  "MBA LSCM",
  "MBA MM",
] as const;
export const SEMESTERS = ["1", "3", "5", "7"] as const;

export const branchSchema = z.enum(BRANCHES, { error: "Please choose a branch from the list." });
export const semesterSchema = z.enum(SEMESTERS, { error: "Please choose a semester (1, 3, 5 or 7)." });

/** No fixed format is defined, so only required and length-capped. */
export const enrollmentSchema = requiredText("the enrollment number", 40);
