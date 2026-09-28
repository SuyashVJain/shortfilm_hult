import { z } from "zod";
import { requiredText } from "./common";

// Character limits are a UX choice, not an event rule (flows.md step 3).
export const FILM_LIMITS = { title: 80, synopsis: 600, sdgApproach: 600 } as const;

/** SDG must be one of the configured themes. */
export function sdgSchema(allowed: number[]) {
  return z.coerce
    .number({ error: "Please choose an SDG." })
    .int()
    .refine((n) => allowed.includes(n), { message: "Please choose one of the listed SDGs." });
}

/** Registration step 3. */
export function filmIdeaSchema(allowedSdgs: number[]) {
  return z.object({
    sdg: sdgSchema(allowedSdgs),
    filmTitle: requiredText("a working film title", FILM_LIMITS.title),
    synopsis: requiredText("a short synopsis", FILM_LIMITS.synopsis),
    sdgApproach: requiredText("how your film addresses the SDG", FILM_LIMITS.sdgApproach),
  });
}
export type FilmIdeaInput = z.infer<ReturnType<typeof filmIdeaSchema>>;

const DRIVE_HOSTS = new Set(["drive.google.com", "docs.google.com"]);

/** Google Drive link only (drive.google.com or docs.google.com, https). */
export const driveUrlSchema = z
  .string({ error: "Please paste your Google Drive link." })
  .trim()
  .min(1, "Please paste your Google Drive link.")
  .refine(
    (v) => {
      try {
        const url = new URL(v);
        return url.protocol === "https:" && DRIVE_HOSTS.has(url.hostname);
      } catch {
        return false;
      }
    },
    { message: "Please use a Google Drive link (drive.google.com or docs.google.com)." },
  );

/** Film submission form (Phase 2). */
export function filmSubmissionSchema(allowedSdgs: number[]) {
  return z.object({
    driveUrl: driveUrlSchema,
    title: requiredText("the film title", FILM_LIMITS.title),
    synopsis: requiredText("a synopsis", FILM_LIMITS.synopsis),
    sdg: sdgSchema(allowedSdgs),
    credits: z.string().trim().max(1000, "Credits must be 1000 characters or fewer.").optional(),
  });
}
