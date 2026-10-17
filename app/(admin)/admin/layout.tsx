import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { SetPasswordForm } from "@/components/auth/SetPasswordForm";
import { requireRole } from "@/lib/guards";
import { hasPassword } from "@/lib/passwords";

export const metadata: Metadata = { title: "Admin | Short Film Competition", robots: { index: false } };

// Calm work area: plain dark, no backdrop or atmosphere. Pages and actions still call requireRole themselves.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireRole("ADMIN");
  const passwordSet = await hasPassword(user.id);
  return (
    <div className="min-h-dvh bg-bg">
      <AdminNav email={user.email} />
      {!passwordSet && (
        // Admin can always sign in with an email code; this just offers a password too.
        <div className="border-b border-amber/40 bg-charcoal">
          <details className="mx-auto max-w-7xl px-4 py-3 sm:px-8">
            <summary className="flex min-h-11 cursor-pointer items-center text-sm text-cream">
              <span className="mr-2 text-amber">○</span>
              You haven&rsquo;t set a password yet. Set one to sign in with email and password.
            </summary>
            <div className="max-w-md pt-4 pb-2">
              <SetPasswordForm />
            </div>
          </details>
        </div>
      )}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
