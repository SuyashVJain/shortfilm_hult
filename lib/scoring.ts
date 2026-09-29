import { z } from "zod";

// Shared by the jury form, the submitEvaluation action and the admin summary.

export type Criterion = { key: string; title: string };
export type Scale = { min: number; max: number };

/** Owner decision: 1–10 unless an admin sets settings.scoringScale. */
export const DEFAULT_SCALE: Scale = { min: 1, max: 10 };

export function scaleFrom(setting: Scale | null | undefined): Scale {
  return setting && setting.min < setting.max ? setting : DEFAULT_SCALE;
}

/** One whole-number score per configured criterion, within the scale. Unknown keys are rejected. */
export function evaluationSchema(criteria: Criterion[], scale: Scale) {
  const score = z.coerce
    .number({ error: `Each score must be a number from ${scale.min} to ${scale.max}.` })
    .int(`Scores must be whole numbers.`)
    .min(scale.min, `Scores must be at least ${scale.min}.`)
    .max(scale.max, `Scores can be at most ${scale.max}.`);
  return z.object({
    scores: z.strictObject(Object.fromEntries(criteria.map((c) => [c.key, score]))),
    comment: z.string().trim().max(2000, "The comment must be 2000 characters or fewer.").optional(),
  });
}

export type ScoreMap = Record<string, number>;

/** Per-criterion SUM and AVERAGE across jurors, plus each juror's total and the overall average total. */
export function summarise(criteria: Criterion[], evaluations: { scores: ScoreMap }[]) {
  const n = evaluations.length;
  const perCriterion = criteria.map((c) => {
    const values = evaluations.map((e) => Number(e.scores[c.key] ?? 0));
    const sum = values.reduce((a, b) => a + b, 0);
    return { key: c.key, title: c.title, sum, average: n ? sum / n : 0 };
  });
  const totals = evaluations.map((e) => criteria.reduce((a, c) => a + Number(e.scores[c.key] ?? 0), 0));
  const overallAverageTotal = n ? totals.reduce((a, b) => a + b, 0) / n : 0;
  return { jurors: n, perCriterion, totals, overallAverageTotal };
}

export const round2 = (x: number) => Math.round(x * 100) / 100;
