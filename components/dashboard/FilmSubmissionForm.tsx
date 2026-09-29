"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveFilmSubmission } from "@/app/(participant)/dashboard/actions";
import { SdgPicker } from "@/components/sdg/SdgPicker";
import { Button, Field, FormNotice, Input, Textarea } from "@/components/ui";
import type { SdgTheme } from "@/lib/settings-defaults";
import { FILM_LIMITS } from "@/lib/validation/film";

export type FilmValues = { sdg: number | null; title: string; synopsis: string; driveUrl: string; credits: string };

function Counter({ value, max }: { value: string; max: number }) {
  return <span className={value.length > max ? "text-red" : undefined}>{value.length} / {max} characters</span>;
}

/** Create or edit the team's film submission. Starts closed when editing an existing entry. */
export function FilmSubmissionForm({
  themes,
  initial,
  maxMinutes,
  isEdit,
}: {
  themes: SdgTheme[];
  initial: FilmValues;
  maxMinutes: number;
  isEdit: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(!isEdit);
  const [v, setV] = useState<FilmValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (key: keyof Omit<FilmValues, "sdg">) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((x) => ({ ...x, [key]: e.target.value }));

  if (!open) {
    return (
      <Button type="button" variant="secondary" onClick={() => { setV(initial); setErrors({}); setFormError(null); setOpen(true); }}>
        Edit submission
      </Button>
    );
  }

  return (
    <form
      noValidate
      className="space-y-8 border border-divider bg-charcoal/60 p-5 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setFormError(null);
        start(async () => {
          const res = await saveFilmSubmission({ ...v, sdg: v.sdg ?? "" });
          if (res.ok) {
            setErrors({});
            if (isEdit) setOpen(false);
            router.refresh();
            return;
          }
          setErrors(res.fieldErrors ?? {});
          setFormError(res.formError ?? (res.fieldErrors ? "Please fix the highlighted fields." : null));
        });
      }}
    >
      <SdgPicker themes={themes} value={v.sdg} onChange={(sdg) => setV((x) => ({ ...x, sdg }))} error={errors.sdg} />
      <Field label="Film title" helper={<Counter value={v.title} max={FILM_LIMITS.title} />} error={errors.title}>
        {(p) => <Input {...p} value={v.title} onChange={set("title")} />}
      </Field>
      <Field label="Synopsis" helper={<Counter value={v.synopsis} max={FILM_LIMITS.synopsis} />} error={errors.synopsis}>
        {(p) => <Textarea {...p} rows={4} value={v.synopsis} onChange={set("synopsis")} />}
      </Field>
      <Field
        label="Google Drive link"
        helper={`Set sharing to "Anyone with the link can view". Maximum film duration: ${maxMinutes} minutes.`}
        error={errors.driveUrl}
      >
        {(p) => (
          <Input {...p} type="url" inputMode="url" spellCheck={false} placeholder="https://drive.google.com/…" value={v.driveUrl} onChange={set("driveUrl")} />
        )}
      </Field>
      <Field label="Credits (optional)" helper="Cast and crew, if you'd like to list them." error={errors.credits}>
        {(p) => <Textarea {...p} rows={3} maxLength={1000} value={v.credits} onChange={set("credits")} />}
      </Field>
      {formError && <FormNotice tone="error">{formError}</FormNotice>}
      <div className="flex flex-col-reverse gap-3 border-t border-divider pt-6 sm:flex-row sm:justify-end">
        {isEdit && (
          <Button type="button" variant="secondary" disabled={pending} onClick={() => setOpen(false)}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending ? "Submitting…" : isEdit ? "Resubmit film" : "Submit film"}
        </Button>
      </div>
    </form>
  );
}
