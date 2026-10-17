"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setInitialPassword } from "@/app/account-actions";
import { Button, Field, FormNotice } from "@/components/ui";
import { newPasswordSchema, PASSWORD_MIN } from "@/lib/validation/password";
import { PasswordInput } from "./PasswordInput";

/** First password for an account that signed in with an email code. */
export function SetPasswordForm({ submitLabel = "Set password", onDone }: { submitLabel?: string; onDone?: () => void }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setFormError(null);
        const parsed = newPasswordSchema.safeParse({ password, confirm });
        if (!parsed.success) {
          const i = parsed.error.issues[0];
          setErrors({ [i.path[0] === "confirm" ? "confirm" : "password"]: i.message });
          return;
        }
        setErrors({});
        start(async () => {
          const res = await setInitialPassword({ password, confirm });
          if (!res.ok) {
            if (res.field) setErrors({ [res.field]: res.error });
            else setFormError(res.error);
            return;
          }
          setPassword("");
          setConfirm("");
          onDone?.();
          router.refresh();
        });
      }}
    >
      <Field label="New password" helper={`At least ${PASSWORD_MIN} characters.`} error={errors.password}>
        {(p) => <PasswordInput {...p} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />}
      </Field>
      <Field label="Confirm password" error={errors.confirm}>
        {(p) => <PasswordInput {...p} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />}
      </Field>
      {formError && <FormNotice tone="error">{formError}</FormNotice>}
      <Button type="submit" disabled={pending} aria-busy={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
