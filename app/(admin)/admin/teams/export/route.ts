import { db } from "@/lib/db";
import { requireRole } from "@/lib/guards";
import { PAYMENT_LABEL } from "@/lib/payment-status";

// Admin-only CSV of teams, members, leader contact and latest payment status.

function csv(value: unknown) {
  let s = value == null ? "" : String(value);
  // Neutralise spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  await requireRole("ADMIN");

  const teams = await db.team.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      leader: { select: { email: true } },
      members: { orderBy: [{ isLeader: "desc" }, { fullName: "asc" }] },
      payments: { orderBy: { submittedAt: "desc" }, take: 1, select: { status: true } },
      submission: { select: { sdg: true, title: true, status: true, driveUrl: true } },
    },
  });

  const header = [
    "Team ID", "Team name", "Leader", "Leader email", "WhatsApp", "Branch", "Semester",
    "SDG", "Film title", "Team size", "Members", "Latest payment", "Locked", "Registered at",
  ];
  const lines = teams.map((t) =>
    [
      t.code, t.name, t.leaderName, t.leader.email, t.whatsapp, t.branch, t.semester,
      t.submission?.sdg ?? t.sdg ?? "Not yet chosen", t.submission?.title ?? t.filmTitle ?? "Not yet chosen", t.members.length,
      t.members.map((m) => `${m.fullName} (${m.enrollmentNumber}, ${m.branch}, sem ${m.semester})${m.isLeader ? " [leader]" : ""}`).join("; "),
      t.payments[0] ? PAYMENT_LABEL[t.payments[0].status] : "None",
      t.locked ? "Yes" : "No",
      t.createdAt.toISOString(),
    ].map(csv).join(","),
  );

  const body = "﻿" + [header.map(csv).join(","), ...lines].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="teams-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
