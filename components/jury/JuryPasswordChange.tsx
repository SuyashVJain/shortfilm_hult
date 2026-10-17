"use client";

import { changeJuryPassword } from "@/app/(jury)/jury/actions";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

/** Juror changes their own password (signs out their other sessions). */
export function JuryPasswordChange() {
  return (
    <ChangePasswordForm
      onSubmit={async (current, password) => changeJuryPassword({ current, password, confirm: password })}
    />
  );
}
