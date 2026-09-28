"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SignOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onClick={async () => {
        setPending(true);
        await authClient.signOut();
        // Refresh so server components re-render without the session.
        router.replace("/");
        router.refresh();
      }}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
