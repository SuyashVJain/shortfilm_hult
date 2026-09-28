import type { Metadata } from "next";
import { FilmStrip, Reveal } from "@/components/cinema";
import { NumbersBand } from "@/components/site/NumbersBand";
import { PublicFooter } from "@/components/site/PublicFooter";
import { ButtonLink, Container, Divider, SectionHeading } from "@/components/ui";
import { pad2 } from "@/lib/event-display";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "The Competition | Short Film Competition",
  description:
    "A university-level short film competition by Hult Prize @ SUAS. Students tell stories around four UN Sustainable Development Goals.",
};

export default async function CompetitionPage() {
  const s = await getSettings();

  return (
    <>
      <Container className="pt-[10dvh] pb-20">
        <Reveal>
          <SectionHeading as="h1" label="The Competition" title="Real stories. Brighter tomorrows." />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 max-w-[65ch] space-y-5 text-lg leading-relaxed text-cream/80">
            <p>
              A university-level competition where students engage with the UN Sustainable Development Goals through
              filmmaking and storytelling.
            </p>
            <p>
              It brings disciplines together and turns social, environmental and institutional challenges into short,
              visual stories.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <dl className="mt-14 grid max-w-3xl gap-8 sm:grid-cols-2">
            <div className="border-t border-divider pt-4">
              <dt className="text-[0.7rem] uppercase tracking-label text-cream-muted">Who can join</dt>
              <dd className="mt-3 font-display text-3xl uppercase text-cream">Open to all SUAS students</dd>
            </div>
            <div className="border-t border-divider pt-4">
              <dt className="text-[0.7rem] uppercase tracking-label text-cream-muted">Teams</dt>
              <dd className="mt-3 font-display text-3xl uppercase text-cream">Inter-branch teams are encouraged</dd>
            </div>
          </dl>
        </Reveal>
      </Container>

      <section aria-label="Key numbers" className="bg-bg/60 py-20">
        <Container>
          <NumbersBand settings={s} />
        </Container>
      </section>

      <FilmStrip />

      <Container className="space-y-24 py-24">
        <section>
          <Reveal>
            <SectionHeading label="Four goals" title="Countless perspectives" />
          </Reveal>
          <ul className="mt-10 divide-y divide-divider border-y border-divider">
            {s.sdgThemes.map((t, i) => (
              <li key={t.number}>
                <Reveal delay={i * 0.06} className="flex items-baseline gap-6 py-5">
                  <span className="w-14 shrink-0 font-display text-3xl" style={{ color: t.color }}>
                    {pad2(t.number)}
                  </span>
                  <span className="text-lg text-cream">{t.title}</span>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <Reveal>
            <SectionHeading label="Proposed award categories, subject to finalization" title="Awards" />
          </Reveal>
          <ul className="mt-10 max-w-3xl space-y-4">
            {s.awardCategories.map((a) => (
              <li key={a.key} className="border-l border-divider pl-5 text-lg text-cream/85">
                {a.title}
              </li>
            ))}
          </ul>
          <Divider className="mt-12 max-w-3xl" />
          <p className="mt-8 font-display text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-none text-cream">{s.prizeText}</p>
        </section>

        <Reveal className="flex flex-col items-start gap-6 border-t border-divider pt-14">
          <p className="font-display text-4xl uppercase leading-tight text-cream sm:text-5xl">Your story matters</p>
          <ButtonLink href="/register">Register your team</ButtonLink>
        </Reveal>
      </Container>

      <PublicFooter />
    </>
  );
}
