import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireRole } from "@/lib/guards";

export const metadata: Metadata = { title: "Admin | Short Film Competition", robots: { index: false } };

// Calm work area: plain dark, no backdrop or atmosphere. Pages and actions still call requireRole themselves.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireRole("ADMIN");
  return (
    <div className="min-h-dvh bg-bg">
      <AdminNav email={user.email} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
