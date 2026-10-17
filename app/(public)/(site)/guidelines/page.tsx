import type { Metadata } from "next";
import { Reveal } from "@/components/cinema";
import { ContactList } from "@/components/site/ContactList";
import { PublicFooter } from "@/components/site/PublicFooter";
import { ButtonLink, Container, SectionHeading } from "@/components/ui";
import { deadlineLong, rupees, teamSizeRange } from "@/lib/event-display";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Guidelines | Short Film Competition",
  description: "Confirmed rules for the Short Film Competition: film length, team size, fee, themes and registration deadline.",
};

// Items not yet defined by the organisers (docs/open-questions.md). No specs invented.
const TBA = [
  "Submission deadline",
  "Film format and technical requirements",
  "Language",
  "Music and copyright",
  "Use of AI",
  // Hidden until prizes are announced. Restore by uncommenting:
  // "Final prize distribution",
];

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-t border-divider py-5 sm:grid-cols-[16rem_1fr] sm:gap-8">
      <dt className="text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted sm:pt-1">{label}</dt>
      <dd className="text-lg text-cream">{children}</dd>
    </div>
  );
}

export default async function GuidelinesPage() {
  const s = await getSettings();

  return (
    <>
      <Container className="pt-[10dvh] pb-24">
        <Reveal>
          <SectionHeading as="h1" label="Guidelines" title="What we know" />
        </Reveal>

        <Reveal delay={0.1}>
          <dl className="mt-12 max-w-4xl border-b border-divider">
            <Fact label="Maximum film duration">{s.maxFilmDurationMinutes} minutes</Fact>
            <Fact label="Team size">
              {teamSizeRange(s.minTeamSize, s.maxTeamSize)} members, including the team leader
            </Fact>
            <Fact label="Registration fee">{rupees(s.registrationFee)} per team</Fact>
            <Fact label="Themes">
              <ul className="space-y-1">
                {s.sdgThemes.map((t) => (
                  <li key={t.number}>
                    <span className="font-display" style={{ color: t.color }}>
                      SDG {t.number}
                    </span>{" "}
                    · {t.title}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-base text-cream/60">Each team chooses one theme.</p>
            </Fact>
            <Fact label="Registration deadline">{deadlineLong(s.registrationDeadline)}</Fact>
            <Fact label="Proposed evaluation criteria">
              <ol className="list-decimal space-y-1 pl-5 marker:text-cream/40">
                {s.evaluationCriteria.map((c) => (
                  <li key={c.key}>{c.title}</li>
                ))}
              </ol>
            </Fact>
          </dl>
        </Reveal>

        <section className="mt-20" aria-labelledby="tba">
          <Reveal>
            <h2 id="tba" className="font-display text-3xl uppercase text-cream sm:text-4xl">
              To be announced
            </h2>
          </Reveal>
          <ul className="mt-8 grid max-w-4xl gap-px border border-divider bg-divider sm:grid-cols-2">
            {TBA.map((item) => (
              <li key={item} className="bg-bg/90 px-5 py-5">
                <p className="text-[0.7rem] uppercase tracking-[0.24em] text-amber">To be announced</p>
                <p className="mt-2 text-lg text-cream">{item}</p>
                <p className="mt-1 text-sm text-cream/60">Details will be shared with registered teams.</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20" aria-labelledby="contact">
          <Reveal>
            <h2 id="contact" className="font-display text-3xl uppercase text-cream sm:text-4xl">
              Contact us
            </h2>
            <p className="mt-3 max-w-[55ch] text-cream/70">Questions about the competition? Message the organisers on WhatsApp.</p>
          </Reveal>
          <div className="mt-8 max-w-4xl">
            <ContactList />
          </div>
        </section>

        <Reveal className="mt-20 border-t border-divider pt-14">
          <ButtonLink href="/register">Register your team</ButtonLink>
        </Reveal>
      </Container>
      <PublicFooter />
    </>
  );
}
