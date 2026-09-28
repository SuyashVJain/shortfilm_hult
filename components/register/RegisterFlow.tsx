"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { EmailOtpForm } from "@/components/auth/EmailOtpForm";
import { Button, FormNotice, Stepper } from "@/components/ui";
import { registerTeam, type RegisterResult } from "@/app/(public)/register/actions";
import { fieldErrors, filmIdeaSchema, paymentSchema, teamDetailsSchema, teamMembersSchema } from "@/lib/validation";
import { Confirmation } from "./Confirmation";
import { StepDetails } from "./StepDetails";
import { StepFilm } from "./StepFilm";
import { StepMembers } from "./StepMembers";
import { StepPayment } from "./StepPayment";
import { StepReview } from "./StepReview";
import { EMPTY_DRAFT, STEPS, type Draft, type Errors, type RegisterSettings } from "./types";

const DRAFT_KEY = "sf-register-draft";

function loadDraft(): Draft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<Draft>;
      // Older drafts may lack newer fields (e.g. enrollment number): fill with blanks.
      return {
        ...EMPTY_DRAFT,
        ...saved,
        details: { ...EMPTY_DRAFT.details, ...saved.details },
        members: (saved.members ?? []).map((m) => ({ ...m, enrollmentNumber: m.enrollmentNumber ?? "" })),
      };
    }
  } catch {}
  return EMPTY_DRAFT;
}

function prefixed(prefix: string, errors: Errors): Errors {
  return Object.fromEntries(Object.entries(errors).map(([k, v]) => [k ? `${prefix}.${k}` : prefix, v]));
}

type Props = { email: string | null; settings: RegisterSettings };

export function RegisterFlow({ email, settings }: Props) {
  const router = useRouter();
  // Mounted client-only (see RegisterClient), so reading storage here is safe.
  const [draft, setDraftState] = useState<Draft>(loadDraft);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Extract<RegisterResult, { ok: true }> | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Mirror the draft (never the OTP) so a refresh keeps progress.
  useEffect(() => {
    if (done) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {}
  }, [draft, done]);

  const setDraft = (update: (d: Draft) => Draft) => setDraftState(update);
  const step = email ? Math.min(Math.max(draft.step, 1), STEPS.length - 1) : 0;

  const goTo = (next: number) => {
    setErrors({});
    setFormError(null);
    setDraftState((d) => ({ ...d, step: next }));
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const rules = {
    minTeamSize: settings.minTeamSize,
    maxTeamSize: settings.maxTeamSize,
    sdgNumbers: settings.sdgThemes.map((t) => t.number),
  };

  function validate(s: number): Errors {
    const members = draft.members.map(({ fullName, enrollmentNumber, branch, semester }) => ({ fullName, enrollmentNumber, branch, semester }));
    const result =
      s === 1
        ? ["details", teamDetailsSchema.safeParse(draft.details)]
        : s === 2
          ? ["members", teamMembersSchema(rules).safeParse(members)]
          : s === 3
            ? ["film", filmIdeaSchema(rules.sdgNumbers).safeParse(draft.film)]
            : s === 4
              ? ["payment", paymentSchema.safeParse(draft.payment)]
              : null;
    if (!result) return {};
    const [prefix, parsed] = result as [string, { success: boolean; error?: Parameters<typeof fieldErrors>[0] }];
    return parsed.success || !parsed.error ? {} : prefixed(prefix, fieldErrors(parsed.error));
  }

  function next() {
    const found = validate(step);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    goTo(step + 1);
  }

  async function submit() {
    if (submitting) return; // guard against double submit
    for (const s of [1, 2, 3, 4]) {
      const found = validate(s);
      if (Object.keys(found).length) {
        goTo(s);
        setErrors(found);
        return;
      }
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const result = await registerTeam({
        details: draft.details,
        members: draft.members.map(({ fullName, enrollmentNumber, branch, semester }) => ({ fullName, enrollmentNumber, branch, semester })),
        film: { ...draft.film, sdg: draft.film.sdg ?? Number.NaN },
        payment: draft.payment,
      });
      if (result.ok) {
        try {
          sessionStorage.removeItem(DRAFT_KEY);
        } catch {}
        setDone(result);
        return;
      }
      if (result.step) goTo(result.step);
      if (result.fieldErrors) setErrors(result.fieldErrors);
      if (result.formError) setFormError(result.formError);
      setSubmitting(false);
    } catch {
      // A redirect (e.g. team already exists) navigates away; anything else is a network error.
      setFormError("Something went wrong. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (done && email) {
    return <Confirmation {...done} email={email} />;
  }

  return (
    <div className="mt-10">
      <Stepper steps={STEPS} current={step} canVisit={(i) => i >= 1 && !submitting} onVisit={goTo} />

      <h2 ref={headingRef} tabIndex={-1} className="mt-10 font-display text-3xl uppercase text-cream outline-none sm:text-4xl">
        {["Verify your email", "Team details", "Team members", "Film idea", "Payment", "Review"][step]}
      </h2>

      <div className="mt-8">
        {step === 0 && (
          <>
            <p className="mb-2 text-cream/70">The team leader verifies their email first. We&rsquo;ll send a 6-digit code.</p>
            {/* After verifying, the server page re-renders with the session and the flow continues. */}
            <EmailOtpForm submitLabel="Verify and continue" onVerified={() => router.refresh()} />
          </>
        )}
        {step === 1 && email && <StepDetails draft={draft} setDraft={setDraft} errors={errors} settings={settings} email={email} />}
        {step === 2 && <StepMembers draft={draft} setDraft={setDraft} errors={errors} settings={settings} />}
        {step === 3 && <StepFilm draft={draft} setDraft={setDraft} errors={errors} settings={settings} />}
        {step === 4 && <StepPayment draft={draft} setDraft={setDraft} errors={errors} settings={settings} />}
        {step === 5 && email && <StepReview draft={draft} email={email} settings={settings} onEdit={goTo} />}
      </div>

      {formError && (
        <FormNotice tone="error" className="mt-8">
          {formError}
        </FormNotice>
      )}

      {step >= 1 && (
        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-divider pt-8 sm:flex-row sm:items-center sm:justify-between">
          {step > 1 ? (
            <Button type="button" variant="secondary" onClick={() => goTo(step - 1)} disabled={submitting}>
              Back
            </Button>
          ) : (
            <span />
          )}
          {step < 5 ? (
            <Button type="button" onClick={next}>
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={submitting} aria-busy={submitting}>
              {submitting ? "Submitting…" : "Confirm registration"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
