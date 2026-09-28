export type TimelineStep = { label: string; state: "done" | "current" | "upcoming"; note?: string };

const STATE_TEXT = { done: "Done", current: "Current", upcoming: "Upcoming" } as const;

/**
 * Participant progress (design-system §7): done = filled, current = red ring,
 * upcoming = hollow. Each state is also written out, never colour-only.
 */
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-5 sm:gap-2">
      {steps.map((s, i) => (
        <li key={s.label} className="relative flex items-start gap-3 sm:flex-col sm:gap-2">
          {i < steps.length - 1 && (
            <span aria-hidden className="absolute top-3 left-[0.6875rem] hidden h-px w-full bg-divider sm:block" />
          )}
          <span
            aria-hidden
            className={`relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-[0.65rem] sm:mt-0 ${
              s.state === "done"
                ? "border-cream bg-cream text-bg"
                : s.state === "current"
                  ? "border-red bg-bg text-cream ring-2 ring-red/40"
                  : "border-cream/30 bg-bg text-cream/40"
            }`}
          >
            {s.state === "done" ? "✓" : i + 1}
          </span>
          <span>
            <span className={`block text-sm ${s.state === "upcoming" ? "text-cream/55" : "text-cream"}`}>{s.label}</span>
            <span className="block text-xs text-cream/50">
              <span className="sr-only">{STATE_TEXT[s.state]}. </span>
              {s.note ?? STATE_TEXT[s.state]}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
