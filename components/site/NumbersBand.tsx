import { Reveal } from "@/components/cinema";
import { StatBlock } from "@/components/ui";
import { deadlineShort, rupees, teamSizeRange } from "@/lib/event-display";
import type { Settings } from "@/lib/settings-defaults";

/** Four event numbers, all from settings. */
export function NumbersBand({ settings }: { settings: Settings }) {
  const stats = [
    { value: `${settings.maxFilmDurationMinutes} MIN`, label: "Maximum film duration" },
    { value: teamSizeRange(settings.minTeamSize, settings.maxTeamSize), label: "Members per team" },
    { value: rupees(settings.registrationFee), label: "Registration per team" },
    { value: deadlineShort(settings.registrationDeadline), label: "Registration deadline" },
  ];
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 0.08}>
          <StatBlock value={<span className="text-[clamp(2.75rem,8vw,5rem)]">{s.value}</span>} label={s.label} />
        </Reveal>
      ))}
    </div>
  );
}
