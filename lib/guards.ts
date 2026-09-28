import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, type Role } from "@/lib/auth";

/** Current session or null. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Where each role lands after login. */
export function homeForRole(role: Role) {
  return role === "ADMIN" ? "/admin" : role === "JURY" ? "/jury" : "/dashboard";
}

/**
 * Call at the top of every protected page, server action and route handler.
 * Unauthenticated users go to /login, wrong roles go to their own home.
 * Ownership checks are still the caller's job.
 */
export async function requireRole(...allowed: Role[]) {
  const session = await getSession();
  if (!session) redirect("/login");
  const role = (session.user.role ?? "PARTICIPANT") as Role;
  if (!allowed.includes(role)) redirect(homeForRole(role));
  return { ...session, role };
}
