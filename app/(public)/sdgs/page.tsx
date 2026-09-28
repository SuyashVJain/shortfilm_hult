import type { Metadata } from "next";
import { Reveal } from "@/components/cinema";
import { SDGCard } from "@/components/sdg/SDGCard";
import { PublicFooter } from "@/components/site/PublicFooter";
import { ButtonLink, Container, SectionHeading } from "@/components/ui";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "The Four Stories | Short Film Competition",
  description: "Four UN Sustainable Development Goals. Each team picks one theme for its short film.",
};

export default async function SdgsPage() {
  const { sdgThemes } = await getSettings();

  return (
    <>
      <Container className="pt-[10dvh] pb-24">
        <Reveal>
          <SectionHeading as="h1" label="SDG Themes" title="The Four Stories" />
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-[55ch] text-lg text-cream/75">Four goals. Countless perspectives. Tap a story to read it.</p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {sdgThemes.map((t, i) => (
            <Reveal key={t.number} delay={i * 0.08}>
              <SDGCard theme={t} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20 flex flex-col items-start gap-6 border-t border-divider pt-14">
          <p className="font-display text-3xl uppercase leading-tight text-cream sm:text-4xl">
            Choose one theme. Your story can make a difference.
          </p>
          <ButtonLink href="/register">Register your team</ButtonLink>
        </Reveal>
      </Container>
      <PublicFooter />
    </>
  );
}
