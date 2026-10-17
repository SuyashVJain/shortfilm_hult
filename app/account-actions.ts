"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/guards";
import { hasPassword } from "@/lib/passwords";
import { newPasswordSchema } from "@/lib/validation/password";

export type SetPasswordResult = { ok: true } | { ok: false; error: string; field?: "password" | "confirm" };

/**
 * Give a password to a signed-in Better Auth account that doesn't have one yet
 * (new sign-ups after the email code, and older code-only accounts).
 * Changing an existing password goes through Better Auth's change-password,
 * which checks the current password.
 */
export async function setInitialPassword(input: { password: string; confirm: string }): Promise<SetPasswordResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in again." };

  const parsed = newPasswordSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.message, field: issue.path[0] === "confirm" ? "confirm" : "password" };
  }
  if (await hasPassword(session.user.id)) {
    return { ok: false, error: "You already have a password. Use Change password instead." };
  }

  try {
    await auth.api.setPassword({ body: { newPassword: parsed.data.password }, headers: await headers() });
  } catch {
    console.warn("setInitialPassword: failed");
    return { ok: false, error: "We couldn't set your password. Please try again." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
