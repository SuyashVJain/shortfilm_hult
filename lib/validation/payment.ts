import { z } from "zod";

/** Transaction ID / UTR. Kept permissive: the payment method is not decided yet (open-questions B1). */
export const utrSchema = z
  .string({ error: "Please enter the transaction ID or UTR." })
  .trim()
  .min(6, "The transaction ID or UTR looks too short.")
  .max(40, "The transaction ID or UTR looks too long.")
  .regex(/^[A-Za-z0-9-]+$/, "Use only letters, numbers and dashes in the transaction ID.");

export const paymentSchema = z.object({
  utr: utrSchema,
  screenshotUrl: z.url({ error: "Please upload a payment screenshot." }),
});
export type PaymentInput = z.infer<typeof paymentSchema>;

/** Screenshot upload rules (architecture §8). */
export const SCREENSHOT_MAX_BYTES = 5 * 1024 * 1024;
export const SCREENSHOT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"] as const;

export function checkScreenshot(file: { size: number; type: string }): string | null {
  if (!SCREENSHOT_TYPES.includes(file.type as (typeof SCREENSHOT_TYPES)[number])) {
    return "Please upload an image (JPG, PNG, WebP or HEIC).";
  }
  if (file.size > SCREENSHOT_MAX_BYTES) return "The screenshot must be 5 MB or smaller.";
  return null;
}
