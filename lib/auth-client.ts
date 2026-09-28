import { createAuthClient } from "better-auth/react";
import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    emailOTPClient(),
    // Mirrors the role field in lib/auth.ts so session.user.role is typed.
    inferAdditionalFields({ user: { role: { type: "string", required: false, input: false } } }),
  ],
});
