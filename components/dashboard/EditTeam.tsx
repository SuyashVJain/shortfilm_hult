"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateTeam } from "@/app/(participant)/dashboard/actions";
import { StepDetails } from "@/components/register/StepDetails";
import { StepMembers } from "@/components/register/StepMembers";
import type { Draft, Errors, RegisterSettings } from "@/components/register/types";
import { Button, FormNotice } from "@/components/ui";

type Props = {
  email: string;
  settings: RegisterSettings;
  /** Current team data, shaped like the registration draft (payment is not editable here). */
  initial: Pick<Draft, "details" | "members">;
};

/**
 * "Edit team" on the dashboard. Reuses the registration step components so the
 * fields, dropdowns and team-size rules stay identical. One form, one save.
 */
export function EditTeam({ email, settings, initial }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>({ step: 1, ...initial, payment: { utr: "", screenshotUrl: "" } });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            // Start from the latest saved data each time the form opens.
            setDraft({ step: 1, ...initial, payment: { utr: "", screenshotUrl: "" } });
            setErrors({});
            setFormError(null);
            setSaved(false);
            setOpen(true);
          }}
        >
          Edit team
        </Button>
        {saved && (
          <p role="status" className="text-sm text-cream/80">
            ✓ Changes saved.
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      noValidate
      className="space-y-10 border border-divider bg-charcoal/60 p-5 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setFormError(null);
        start(async () => {
          const res = await updateTeam({
            details: draft.details,
            members: draft.members.map(({ fullName, enrollmentNumber, branch, semester }) => ({ fullName, enrollmentNumber, branch, semester })),
          });
          if (res.ok) {
            setErrors({});
            setSaved(true);
            setOpen(false);
            router.refresh(); // re-render the dashboard with the saved data
            return;
          }
          setErrors(res.fieldErrors ?? {});
          setFormError(res.formError ?? (res.fieldErrors ? "Please fix the highlighted fields." : null));
        });
      }}
    >
      <div>
        <h3 className="mb-6 text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">Team details</h3>
        <StepDetails draft={draft} setDraft={setDraft} errors={errors} settings={settings} email={email} />
      </div>
      <div>
        <h3 className="mb-6 text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">Members</h3>
        <StepMembers draft={draft} setDraft={setDraft} errors={errors} settings={settings} />
      </div>
      {formError && <FormNotice tone="error">{formError}</FormNotice>}
      <div className="flex flex-col-reverse gap-3 border-t border-divider pt-6 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" disabled={pending} onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
