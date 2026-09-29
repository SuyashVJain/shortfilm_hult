"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitEvaluation } from "@/app/(jury)/jury/actions";
import { Button, Field, FormNotice, Input, Textarea } from "@/components/ui";
import type { Criterion, Scale, ScoreMap } from "@/lib/scoring";

type Props = { teamId: string; criteria: Criterion[]; scale: Scale; initialScores: ScoreMap; initialComment: string };

/** Enter scores -> Review -> Submit final scores (locks). */
export function ScoreForm({ teamId, criteria, scale, initialScores, initialComment }: Props) {
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, string>>(
    Object.fromEntries(criteria.map((c) => [c.key, initialScores[c.key] != null ? String(initialScores[c.key]) : ""])),
  );
  const [comment, setComment] = useState(initialComment);
  const [step, setStep] = useState<"enter" | "review">("enter");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const invalid = (v: string) => {
    const n = Number(v);
    return v.trim() === "" || !Number.isInteger(n) || n < scale.min || n > scale.max;
  };

  function toReview() {
    const found: Record<string, string> = {};
    for (const c of criteria) if (invalid(scores[c.key])) found[c.key] = `Enter a whole number from ${scale.min} to ${scale.max}.`;
    setErrors(found);
    setFormError(Object.keys(found).length ? "Please score every criterion." : null);
    if (!Object.keys(found).length) setStep("review");
  }

  if (step === "review") {
    return (
      <div className="space-y-6">
        <p className="text-sm text-cream/75">Check your scores before submitting.</p>
        <dl className="divide-y divide-divider border border-divider">
          {criteria.map((c) => (
            <div key={c.key} className="flex items-center justify-between gap-4 bg-charcoal px-4 py-3 text-sm">
              <dt className="text-cream/80">{c.title}</dt>
              <dd className="font-mono text-lg text-cream">{scores[c.key]}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 bg-charcoal-2 px-4 py-3 text-sm">
            <dt className="uppercase tracking-[0.18em] text-cream-muted">Total</dt>
            <dd className="font-mono text-lg text-cream">{criteria.reduce((a, c) => a + Number(scores[c.key]), 0)}</dd>
          </div>
        </dl>
        {comment.trim() && <p className="whitespace-pre-line text-sm text-cream/75">Comment: {comment.trim()}</p>}
        <FormNotice tone="error">You won&rsquo;t be able to change this after submitting.</FormNotice>
        {formError && <FormNotice tone="error">{formError}</FormNotice>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" disabled={pending} onClick={() => setStep("enter")}>
            Edit
          </Button>
          <Button
            type="button"
            disabled={pending}
            aria-busy={pending}
            onClick={() =>
              start(async () => {
                setFormError(null);
                const res = await submitEvaluation(
                  teamId,
                  Object.fromEntries(criteria.map((c) => [c.key, Number(scores[c.key])])),
                  comment,
                );
                if (res.ok) {
                  router.refresh();
                  return;
                }
                setFormError(res.error);
                if (res.fieldErrors) setStep("enter");
              })
            }
          >
            {pending ? "Submitting…" : "Submit final scores"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        toReview();
      }}
    >
      <p className="text-sm text-cream/60">
        Score each criterion from {scale.min} to {scale.max}.
      </p>
      <div className="divide-y divide-divider border border-divider">
        {criteria.map((c) => (
          <div key={c.key} className="grid items-center gap-3 bg-charcoal px-4 py-3 sm:grid-cols-[1fr_8rem]">
            <Field label={c.title} error={errors[c.key]}>
              {(p) => (
                <Input
                  {...p}
                  type="number"
                  inputMode="numeric"
                  min={scale.min}
                  max={scale.max}
                  step={1}
                  value={scores[c.key]}
                  onChange={(e) => setScores((s) => ({ ...s, [c.key]: e.target.value }))}
                  className="max-w-32 text-center font-mono text-lg"
                />
              )}
            </Field>
          </div>
        ))}
      </div>
      <Field label="Overall comment (optional)">
        {(p) => <Textarea {...p} rows={3} maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)} />}
      </Field>
      {formError && <FormNotice tone="error">{formError}</FormNotice>}
      <div className="flex justify-end">
        <Button type="submit">Review scores</Button>
      </div>
    </form>
  );
}
