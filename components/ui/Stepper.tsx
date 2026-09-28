"use client";

type Step = { label: string };

type Props = {
  steps: Step[];
  current: number;
  /** Steps before `current` that may be revisited. */
  canVisit: (index: number) => boolean;
  onVisit: (index: number) => void;
};

/** Numbered steps on a thin line; active step red; completed steps are buttons. */
export function Stepper({ steps, current, canVisit, onVisit }: Props) {
  return (
    <nav aria-label="Registration progress">
      <p className="mb-3 text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted sm:hidden">
        Step {current + 1} of {steps.length}: <span className="text-cream">{steps[current].label}</span>
      </p>
      <ol className="relative flex items-start justify-between">
        <span aria-hidden className="absolute top-[22px] right-0 left-0 h-px bg-divider" />
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const clickable = done && canVisit(i);
          const circle = `relative flex size-11 items-center justify-center rounded-full border text-sm font-medium transition-colors ${
            active
              ? "border-red bg-red text-cream"
              : done
                ? "border-cream/60 bg-charcoal text-cream"
                : "border-cream/20 bg-bg text-cream/45"
          }`;
          const content = (
            <>
              <span className={circle}>{done ? "✓" : i + 1}</span>
              <span
                className={`mt-2 hidden text-[0.65rem] uppercase tracking-[0.2em] sm:block ${
                  active ? "text-cream" : "text-cream/50"
                }`}
              >
                {step.label}
              </span>
            </>
          );
          return (
            <li key={step.label} className="relative flex flex-col items-center">
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onVisit(i)}
                  className="flex min-h-12 flex-col items-center"
                  aria-label={`Back to step ${i + 1}: ${step.label}`}
                >
                  {content}
                </button>
              ) : (
                <div className="flex flex-col items-center" aria-current={active ? "step" : undefined}>
                  <span className="sr-only">
                    Step {i + 1}: {step.label}
                    {done ? " (done)" : active ? " (current)" : ""}
                  </span>
                  <span aria-hidden className="contents">
                    {content}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
