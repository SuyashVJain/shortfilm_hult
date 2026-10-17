"use client";

import { useState, useTransition } from "react";
import { Button, Field, FormNotice } from "@/components/ui";
import { changePasswordSchema, PASSWORD_MIN } from "@/lib/validation/password";
import { PasswordInput } from "./PasswordInput";

export type ChangePasswordResult = { ok: true } | { ok: false; error: string };

type Props = {
  /** Performs the change: Better Auth client for participants/admin, a server action for jury. */
  onSubmit: (current: string, password: string) => Promise<ChangePasswordResult>;
};

/** Collapsible "Change password" (current, new, confirm). Signs out other devices. */
export function ChangePasswordForm({ onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({ current: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ChangePasswordResult | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV((x) => ({ ...x, [k]: e.target.value }));

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <Button type="button" variant="secondary" onClick={() => { setResult(null); setOpen(true); }}>
          Change password
        </Button>
        {result?.ok && <p role="status" className="text-sm text-cream/80">✓ Password changed. Other devices were signed out.</p>}
      </div>
    );
  }

  return (
    <form
      noValidate
      className="max-w-md space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setResult(null);
        const parsed = changePasswordSchema.safeParse(v);
        if (!parsed.success) {
          setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
          return;
        }
        setErrors({});
        start(async () => {
          const res = await onSubmit(v.current, v.password);
          setResult(res);
          if (res.ok) {
            setV({ current: "", password: "", confirm: "" });
            setOpen(false);
          }
        });
      }}
    >
      <Field label="Current password" error={errors.current}>
        {(p) => <PasswordInput {...p} value={v.current} onChange={set("current")} autoComplete="current-password" />}
      </Field>
      <Field label="New password" helper={`At least ${PASSWORD_MIN} characters.`} error={errors.password}>
        {(p) => <PasswordInput {...p} value={v.password} onChange={set("password")} autoComplete="new-password" />}
      </Field>
      <Field label="Confirm new password" error={errors.confirm}>
        {(p) => <PasswordInput {...p} value={v.confirm} onChange={set("confirm")} autoComplete="new-password" />}
      </Field>
      {result && !result.ok && <FormNotice tone="error">{result.error}</FormNotice>}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending ? "Saving…" : "Change password"}
        </Button>
        <Button type="button" variant="secondary" disabled={pending} onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
