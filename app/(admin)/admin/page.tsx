// PLACEHOLDER: temporary admin area (Phase 1 builds the team table and payment queue).
import { RolePlaceholder } from "@/components/site/RolePlaceholder";
import { requireRole } from "@/lib/guards";

export default async function AdminPage() {
  const { user, role } = await requireRole("ADMIN");
  return <RolePlaceholder area="Admin" email={user.email} role={role} />;
}
