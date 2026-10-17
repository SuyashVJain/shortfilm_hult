import { z } from "zod";

// Shared by participant/admin (Better Auth) and jury password forms.
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

export const passwordSchema = z
  .string({ error: "Please enter a password." })
  .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`)
  .max(PASSWORD_MAX, `Use at most ${PASSWORD_MAX} characters.`);

/** New password + confirmation. */
export const newPasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "The two passwords don't match." });

/** Current + new + confirmation (change password). */
export const changePasswordSchema = z
  .object({ current: z.string().min(1, "Please enter your current password."), password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "The two passwords don't match." })
  .refine((v) => v.password !== v.current, { path: ["password"], message: "Choose a password different from your current one." });

export const emailSchema = z.email({ error: "Please enter a valid email address." });
export const otpSchema = z.string().regex(/^\d{6}$/, { error: "Please enter the 6-digit code from the email." });
