"use client";

import { useState, useTransition } from "react";
import { setFilmStatus } from "@/app/(admin)/admin/actions";

type Status = "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "NOT_SUBMITTED";

/** Under review / Approve / Reject (with a note) for one film submission. Mirrors PaymentReview. */
export function FilmReview({ submissionId, status }: { submissionId: string; status: Status }) {
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const run = (next: "UNDER_REVIEW" | "APPROVED" | "REJECTED") =>
    start(async () => {
      setMessage(null);
      const res = await setFilmStatus(submissionId, next, next === "REJECTED" ? note : undefined);
      setMessage(res.ok ? { ok: true, text: res.message ?? "Saved." } : { ok: false, text: res.error });
      if (res.ok) setRejecting(false);
    });

  const btn = "min-h-11 px-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors disabled:opacity-40";

  return (
    <div className="space-y-3">
      {!rejecting ? (
        <div className="flex flex-wrap gap-2">
          {status !== "UNDER_REVIEW" && (
            <button type="button" disabled={pending} onClick={() => run("UNDER_REVIEW")} className={`${btn} border border-cream/40 text-cream hover:border-cream`}>
              Mark under review
            </button>
          )}
          {status !== "APPROVED" && (
            <button type="button" disabled={pending} onClick={() => run("APPROVED")} className={`${btn} bg-cream text-bg hover:bg-white`}>
              Approve film
            </button>
          )}
          <button type="button" disabled={pending} onClick={() => setRejecting(true)} className={`${btn} border border-red/70 text-cream hover:bg-red/15`}>
            Reject film
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (note.trim().length < 5) return setMessage({ ok: false, text: "Please give a reason of at least 5 characters." });
            run("REJECTED");
          }}
          className="space-y-2"
        >
          <label htmlFor={`film-note-${submissionId}`} className="block text-[0.65rem] uppercase tracking-[0.18em] text-cream-muted">
            Reason (shown to the team)
          </label>
          <textarea
            id={`film-note-${submissionId}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={500}
            autoFocus
            className="block w-full rounded-sm border border-cream/25 bg-charcoal px-3 py-2 text-sm text-cream focus:border-red focus:outline-none"
            placeholder="For example: the Drive link is not shared publicly"
          />
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={pending} className={`${btn} bg-red text-cream hover:bg-[#ee2a3b]`}>
              {pending ? "Saving…" : "Confirm reject"}
            </button>
            <button type="button" disabled={pending} onClick={() => setRejecting(false)} className={`${btn} text-cream/70 hover:text-cream`}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {message && (
        <p role={message.ok ? "status" : "alert"} className={`text-sm ${message.ok ? "text-cream/80" : "text-[#ff6b77]"}`}>
          {message.ok ? `✓ ${message.text}` : message.text}
        </p>
      )}
    </div>
  );
}
