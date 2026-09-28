// PLACEHOLDER: temporary participant dashboard (Phase 2 builds the real one).
import { RolePlaceholder } from "@/components/site/RolePlaceholder";
import { requireRole } from "@/lib/guards";

export default async function DashboardPage() {
  const { user, role } = await requireRole("PARTICIPANT");
  return <RolePlaceholder area="Dashboard" email={user.email} role={role} />;
}
