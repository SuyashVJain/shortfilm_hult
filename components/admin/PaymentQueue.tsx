"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/components/ui";
import type { QueueItem } from "@/lib/admin-data";
import { PAYMENT_LABEL, PAYMENT_TONE } from "@/lib/payment-status";
import { PaymentReview } from "./PaymentReview";
import { ScreenshotDialog } from "./ScreenshotDialog";

const date = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

/** Review list. Reviewed items leave immediately; the server revalidates in the background. */
export function PaymentQueue({ items, reviewable }: { items: QueueItem[]; reviewable: boolean }) {
  const [gone, setGone] = useState<Set<string>>(new Set());
  const [flash, setFlash] = useState<string | null>(null);
  const visible = items.filter((i) => !gone.has(i.id));

  return (
    <>
      <p aria-live="polite" className="min-h-6 text-sm text-cream/70">
        {flash}
      </p>
      {visible.length === 0 ? (
        <p className="border border-divider bg-charcoal px-5 py-10 text-center text-cream/60">Nothing in this list.</p>
      ) : (
        <ul className="divide-y divide-divider border border-divider">
          {visible.map((p) => (
            <li key={p.id} className="grid gap-4 bg-charcoal px-4 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-start sm:px-5">
              <ScreenshotDialog src={p.screenshotUrl} label={`Payment screenshot for ${p.team.code}`} />
              <div className="min-w-0 space-y-1 text-sm">
                <p>
                  <Link href={`/admin/teams/${p.team.id}`} className="font-mono text-cream hover:underline">
                    {p.team.code}
                  </Link>{" "}
                  <span className="text-cream/85">{p.team.name}</span>
                </p>
                <p className="text-cream/70">
                  UTR <span className="font-mono text-cream">{p.utr}</span> · ₹{p.amount}
                </p>
                <p className="text-cream/50">Submitted {date.format(new Date(p.submittedAt))}</p>
                <StatusBadge tone={PAYMENT_TONE[p.status]}>{PAYMENT_LABEL[p.status]}</StatusBadge>
                {p.rejectReason && <p className="text-cream/70">Reason: {p.rejectReason}</p>}
              </div>
              {reviewable && (
                <PaymentReview
                  paymentId={p.id}
                  onDone={(status) => {
                    setGone((s) => new Set(s).add(p.id));
                    setFlash(`${p.team.code} ${status === "VERIFIED" ? "verified" : "rejected"}.`);
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
