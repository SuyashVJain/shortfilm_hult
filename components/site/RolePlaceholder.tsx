import { SignOutButton } from "@/components/site/SignOutButton";
import { Container, SectionHeading } from "@/components/ui";

/** PLACEHOLDER for protected areas: shows who is signed in. Remove when the real pages land. */
export function RolePlaceholder({ area, email, role }: { area: string; email: string; role: string }) {
  return (
    <Container className="py-[12dvh]">
      <SectionHeading as="h1" label="Placeholder" title={area} />
      <dl className="mt-10 grid max-w-md grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-sm">
        <dt className="uppercase tracking-[0.24em] text-cream-muted">Email</dt>
        <dd className="text-cream">{email}</dd>
        <dt className="uppercase tracking-[0.24em] text-cream-muted">Role</dt>
        <dd className="text-cream">{role}</dd>
      </dl>
      <SignOutButton className="mt-10 min-h-11 text-xs uppercase tracking-[0.24em] text-cream/70 underline underline-offset-4 hover:text-cream" />
    </Container>
  );
}
