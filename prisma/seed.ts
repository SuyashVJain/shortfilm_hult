// Idempotent seed: default settings rows (only where missing) and the first admin.
// Run: npm run db:seed
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Prisma, PrismaClient } from "../lib/generated/prisma/client";
import { DEFAULT_SETTINGS, SETTING_KEYS } from "../lib/settings-defaults";

// Own client: lib/db.ts is server-only and cannot be imported from a script.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

async function seedSettings() {
  const existing = new Set((await db.eventSetting.findMany({ select: { key: true } })).map((r) => r.key));
  const missing = SETTING_KEYS.filter((k) => !existing.has(k));
  for (const key of missing) {
    const value = DEFAULT_SETTINGS[key];
    await db.eventSetting.create({
      // JSON columns need the Prisma.JsonNull sentinel for a stored null (scoringScale).
      data: { key, value: value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue) },
    });
  }
  console.log(missing.length ? `Settings: added ${missing.join(", ")}` : "Settings: all present");
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    console.log("Admin: ADMIN_EMAIL not set, skipped");
    return;
  }
  const user = await db.user.upsert({
    where: { email },
    create: { id: randomUUID(), email, name: email.split("@")[0], emailVerified: true, role: "ADMIN" },
    update: { role: "ADMIN" },
  });
  console.log(`Admin: ${user.email} is ADMIN`);
}

async function main() {
  await seedSettings();
  await seedAdmin();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
