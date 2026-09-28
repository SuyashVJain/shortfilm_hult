"use client";

import { useState, useTransition } from "react";
import { setTeamLocked } from "@/app/(admin)/admin/actions";

export function LockToggle({ teamId, locked }: { teamId: string; locked: boolean }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-4">
      <p className="text-sm text-cream/80">
        Editing: <span className="font-semibold text-cream">{locked ? "Locked" : "Open"}</span>
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await setTeamLocked(teamId, !locked);
            setMessage(res.ok ? (res.message ?? null) : res.error);
          })
        }
        className="min-h-11 border border-cream/40 px-4 text-xs uppercase tracking-[0.18em] text-cream hover:border-cream disabled:opacity-40"
      >
        {pending ? "Saving…" : locked ? "Unlock editing" : "Lock editing"}
      </button>
      <span aria-live="polite" className="text-sm text-cream/60">
        {message}
      </span>
    </div>
  );
}
