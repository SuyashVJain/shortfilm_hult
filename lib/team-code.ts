import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

const COUNTER_KEY = "team_code";

export function formatTeamCode(n: number) {
  return `HP-SF-${String(n).padStart(3, "0")}`;
}

/**
 * Next team code (HP-SF-001, HP-SF-002, ...).
 * The upsert is a single atomic increment in Postgres, so concurrent
 * registrations never get the same number. Pass the caller's transaction
 * client so the number is only consumed if the team is actually created.
 */
export async function nextTeamCode(tx?: Prisma.TransactionClient) {
  const run = async (client: Prisma.TransactionClient) => {
    const counter = await client.counter.upsert({
      where: { key: COUNTER_KEY },
      create: { key: COUNTER_KEY, value: 1 },
      update: { value: { increment: 1 } },
    });
    return formatTeamCode(counter.value);
  };
  return tx ? run(tx) : db.$transaction(run);
}
