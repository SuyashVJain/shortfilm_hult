import { Container, SectionHeading } from "@/components/ui";

/** PLACEHOLDER body for public pages not built yet. */
export function ComingSoon({ label, title }: { label: string; title: string }) {
  return (
    <Container className="py-[12dvh]">
      <SectionHeading as="h1" label={label} title={title} />
      <p className="mt-8 text-cream/70">Coming soon.</p>
    </Container>
  );
}
