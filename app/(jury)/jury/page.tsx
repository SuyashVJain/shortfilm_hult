// PLACEHOLDER: temporary jury area (Phase 3 builds the real one).
import { RolePlaceholder } from "@/components/site/RolePlaceholder";
import { requireRole } from "@/lib/guards";

export default async function JuryPage() {
  const { user, role } = await requireRole("JURY", "ADMIN");
  return <RolePlaceholder area="Jury" email={user.email} role={role} />;
}
