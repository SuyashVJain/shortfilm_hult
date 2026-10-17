"use client";

import { authClient } from "@/lib/auth-client";
import { ChangePasswordForm } from "./ChangePasswordForm";

/** Change password for participants and admin (Better Auth checks the current password). */
export function AccountPasswordChange() {
  return (
    <ChangePasswordForm
      onSubmit={async (current, password) => {
        const { error } = await authClient.changePassword({
          currentPassword: current,
          newPassword: password,
          revokeOtherSessions: true,
        });
        if (!error) return { ok: true };
        if (error.status === 429) return { ok: false, error: "Too many attempts. Please wait a minute and try again." };
        return { ok: false, error: "Your current password isn't right, or the new one isn't allowed. Please try again." };
      }}
    />
  );
}
