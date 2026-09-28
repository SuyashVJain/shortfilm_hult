// PLACEHOLDER: event settings editor comes later.
import { requireRole } from "@/lib/guards";

export default async function AdminSettingsPage() {
  await requireRole("ADMIN");
  return (
    <>
      <h1 className="font-display text-4xl uppercase text-cream">Settings</h1>
      <p className="mt-6 text-cream/70">Coming soon.</p>
    </>
  );
}
