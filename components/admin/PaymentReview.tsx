"use client";

import { useState, useTransition } from "react";
import { rejectPayment, verifyPayment } from "@/app/(admin)/admin/actions";

/** Verify / Reject controls for one PENDING payment. Reject requires a reason. */
export function PaymentReview({ paymentId, onDone }: { paymentId: string; onDone?: (status: "VERIFIED" | "REJECTED") => void }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = (status: "VERIFIED" | "REJECTED") =>
    start(async () => {
      setError(null);
      const res = status === "VERIFIED" ? await verifyPayment(paymentId) : await rejectPayment(paymentId, reason);
      if (res.ok) onDone?.(status);
      else setError(res.error);
    });

  const btn = "min-h-11 px-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors disabled:opacity-40";

  return (
    <div className="space-y-3">
      {!rejecting ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={pending} onClick={() => run("VERIFIED")} className={`${btn} bg-cream text-bg hover:bg-white`}>
            {pending ? "Saving…" : "Verify payment"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setRejecting(true)}
            className={`${btn} border border-red/70 text-cream hover:bg-red/15`}
          >
            Reject payment
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (reason.trim().length < 5) return setError("Please give a reason of at least 5 characters.");
            run("REJECTED");
          }}
          className="space-y-2"
        >
          <label className="block text-[0.65rem] uppercase tracking-[0.18em] text-cream-muted" htmlFor={`reason-${paymentId}`}>
            Reason (sent to the team)
          </label>
          <textarea
            id={`reason-${paymentId}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            maxLength={500}
            autoFocus
            className="block w-full rounded-sm border border-cream/25 bg-charcoal px-3 py-2 text-sm text-cream focus:border-red focus:outline-none"
            placeholder="For example: UTR does not match the screenshot"
          />
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={pending} className={`${btn} bg-red text-cream hover:bg-[#ee2a3b]`}>
              {pending ? "Saving…" : "Confirm reject"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setRejecting(false);
                setError(null);
              }}
              className={`${btn} text-cream/70 hover:text-cream`}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {error && (
        <p role="alert" className="text-sm text-[#ff6b77]">
          {error}
        </p>
      )}
    </div>
  );
}
