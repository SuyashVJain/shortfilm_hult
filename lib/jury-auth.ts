import "server-only";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

/*
 * Jury auth: username + password set by an admin, with its own session table.
 * Completely separate from Better Auth (email OTP) used by participants/admins.
 */

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export const JURY_COOKIE = "jury_session";
const SESSION_HOURS = 12;
const KEYLEN = 64;

/** "scrypt$<salt b64>$<hash b64>". Never returned from actions or logged. */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEYLEN);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** Issue a session for an active account and set the cookie. */
export async function startJurySession(juryAccountId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600 * 1000);
  await db.jurySession.create({ data: { tokenHash: sha256(token), juryAccountId, expiresAt } });
  (await cookies()).set(JURY_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function endJurySession() {
  const jar = await cookies();
  const token = jar.get(JURY_COOKIE)?.value;
  if (token) await db.jurySession.deleteMany({ where: { tokenHash: sha256(token) } });
  jar.delete(JURY_COOKIE);
}

export type Juror = { id: string; username: string; displayName: string; locationId: string; locationName: string };

/** Current juror, or null (no cookie, expired session, or deactivated account). */
export async function getJury(): Promise<Juror | null> {
  const token = (await cookies()).get(JURY_COOKIE)?.value;
  if (!token) return null;
  const session = await db.jurySession.findUnique({
    where: { tokenHash: sha256(token) },
    select: {
      expiresAt: true,
      juryAccount: {
        select: { id: true, username: true, displayName: true, active: true, locationId: true, location: { select: { name: true } } },
      },
    },
  });
  if (!session || session.expiresAt < new Date() || !session.juryAccount.active) return null;
  const a = session.juryAccount;
  return { id: a.id, username: a.username, displayName: a.displayName, locationId: a.locationId, locationName: a.location.name };
}

/** Guard for jury pages and actions (analogous to requireRole). */
export async function requireJury(): Promise<Juror> {
  const juror = await getJury();
  if (!juror) redirect("/jury/login");
  return juror;
}
