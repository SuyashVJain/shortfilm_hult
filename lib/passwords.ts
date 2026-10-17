import "server-only";
import { db } from "@/lib/db";

/** True if this Better Auth user has a password set (a "credential" account with a hash). */
export async function hasPassword(userId: string) {
  const account = await db.account.findFirst({
    where: { userId, providerId: "credential", password: { not: null } },
    select: { id: true },
  });
  return !!account;
}
