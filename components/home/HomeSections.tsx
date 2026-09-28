import Link from "next/link";
import { FilmStrip, Reveal } from "@/components/cinema";
import { NumbersBand } from "@/components/site/NumbersBand";
import { PublicFooter } from "@/components/site/PublicFooter";
import { ButtonLink, Container, SectionHeading } from "@/components/ui";
import { pad2 } from "@/lib/event-display";
import type { Settings } from "@/lib/settings-defaults";

const STEPS = ["Register", "Payment review", "Submit film", "Jury", "Results"];

/**
 * Everything below the one-screen hero. A solid dark background keeps the
 * fixed backdrop visible only behind the hero, with no scroll listeners.
 */
export function HomeSections({ settings }: { settings: Settings }) {
  return (
    <div className="relative bg-bg/90">
      <FilmStrip />

      <section aria-label="Key numbers" className="py-24">
        <Container>
          <NumbersBand settings={settings} />
          <Reveal>
            <p className="mt-14 max-w-[52ch] text-lg leading-relaxed text-cream/75">
              A short film around one of four UN Sustainable Development Goals. Open to all SUAS students.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="border-t border-divider py-24">
        <Container>
          <Reveal>
            <SectionHeading label="SDG Themes" title="The Four Stories" />
          </Reveal>
          <ul className="mt-12 flex flex-wrap gap-x-10 gap-y-6">
            {settings.sdgThemes.map((t, i) => (
              <li key={t.number}>
                <Reveal delay={i * 0.08}>
                  <Link
                    href="/sdgs"
                    className="group block border-b border-transparent pb-2 transition-colors hover:border-current focus-visible:border-current"
                    style={{ color: t.color }}
                    aria-label={`SDG ${t.number}: ${t.title}`}
                  >
                    <span className="font-display text-[clamp(4rem,14vw,8rem)] leading-none">{pad2(t.number)}</span>
                    <span className="mt-1 block max-w-[14rem] text-sm text-cream/70 group-hover:text-cream">{t.title}</span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal>
            <Link href="/sdgs" className="mt-12 inline-flex min-h-11 items-center text-xs uppercase tracking-[0.24em] text-cream underline underline-offset-8">
              Explore the SDGs
            </Link>
          </Reveal>
        </Container>
      </section>

      <FilmStrip />

      <section className="py-24">
        <Container>
          <Reveal>
            <SectionHeading label="How it works" title="From idea to screen" />
          </Reveal>
          <ol className="mt-12 grid gap-px border border-divider bg-divider sm:grid-cols-5">
            {STEPS.map((step, i) => (
              <li key={step} className="bg-bg px-5 py-6">
                <Reveal delay={i * 0.06}>
                  <span className="font-display text-3xl text-red">{pad2(i + 1)}</span>
                  <span className="mt-3 block text-sm uppercase tracking-[0.2em] text-cream">{step}</span>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-t border-divider py-28">
        <Container>
          <Reveal className="flex flex-col items-start gap-8">
            {/* Hidden until prizes are announced. Restore by uncommenting:
            <p className="text-[0.7rem] uppercase tracking-label text-cream-muted">{settings.prizeText}</p>
            */}
            <p className="font-display text-[clamp(3rem,10vw,7rem)] uppercase leading-[0.9] text-cream">
              Your story
              <br />
              matters
            </p>
            <ButtonLink href="/register">Register your team</ButtonLink>
          </Reveal>
        </Container>
      </section>

      <PublicFooter />
    </div>
  );
}
