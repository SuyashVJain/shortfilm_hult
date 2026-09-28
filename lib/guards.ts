import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { homeForRole, toRole, type Role } from "@/lib/roles";

export { homeForRole } from "@/lib/roles";

/** Current session or null. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Call at the top of every protected page, server action and route handler.
 * Unauthenticated users go to /login, wrong roles go to their own home.
 * Ownership checks are still the caller's job.
 */
export async function requireRole(...allowed: Role[]) {
  const session = await getSession();
  if (!session) redirect("/login");
  const role = toRole(session.user.role);
  if (!allowed.includes(role)) redirect(homeForRole(role));
  return { ...session, role };
}
