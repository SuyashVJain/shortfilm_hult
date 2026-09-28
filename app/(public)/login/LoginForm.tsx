"use client";

import { useRouter } from "next/navigation";
import { EmailOtpForm } from "@/components/auth/EmailOtpForm";
import { homeForRole, toRole } from "@/lib/roles";

export function LoginForm({ next }: { next: string | null }) {
  const router = useRouter();
  return (
    <EmailOtpForm
      onVerified={(user) => {
        // Middleware and server components see the new session cookie on this navigation.
        router.replace(next ?? homeForRole(toRole(user.role)));
        router.refresh();
      }}
    />
  );
}
