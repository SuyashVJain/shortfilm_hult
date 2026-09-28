// Shared by server and client code (no server-only imports here).

export const ROLES = ["PARTICIPANT", "JURY", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export function toRole(value: unknown): Role {
  return ROLES.includes(value as Role) ? (value as Role) : "PARTICIPANT";
}

/** Where each role lands after login. */
export function homeForRole(role: Role) {
  return role === "ADMIN" ? "/admin" : role === "JURY" ? "/jury" : "/dashboard";
}

/** Only same-site relative paths: starts with "/" but not "//" or "/\". */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}
