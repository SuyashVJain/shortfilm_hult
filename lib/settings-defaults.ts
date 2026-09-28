import { z } from "zod";

/*
 * Event settings: schema and defaults.
 * Defaults come ONLY from confirmed facts in docs/event-facts.md.
 * Anything undefined (scoring scale, payment instructions) defaults to empty.
 * Never add a prize amount here (event-facts §2).
 */

export const sdgThemeSchema = z.object({
  number: z.number().int(),
  title: z.string(),
  description: z.string(),
  color: z.string(),
});

export const settingsSchema = z.object({
  eventTitle: z.string(),
  /** ISO timestamp. Registration closes at the end of this day, India time. */
  registrationDeadline: z.iso.datetime({ offset: true }),
  /** INR per team. */
  registrationFee: z.number().int().nonnegative(),
  minTeamSize: z.number().int().positive(),
  maxTeamSize: z.number().int().positive(),
  maxFilmDurationMinutes: z.number().positive(),
  registrationOpen: z.boolean(),
  submissionOpen: z.boolean(),
  prizeText: z.string(),
  awardCategories: z.array(z.object({ key: z.string(), title: z.string(), proposed: z.boolean() })),
  sdgThemes: z.array(sdgThemeSchema),
  evaluationCriteria: z.array(z.object({ key: z.string(), title: z.string(), weight: z.number().optional() })),
  /** Not defined by the organisers yet (open-questions C1). Admin sets it. */
  scoringScale: z.object({ min: z.number(), max: z.number() }).nullable(),
  paymentInstructions: z.object({ text: z.string(), qrImageUrl: z.string().nullable() }),
});

export type Settings = z.infer<typeof settingsSchema>;
export type SettingKey = keyof Settings;
export type SdgTheme = z.infer<typeof sdgThemeSchema>;

export const DEFAULT_SETTINGS: Settings = {
  eventTitle: "Short Film Competition",
  // 7 October 2026 (event-facts §2). End of day, IST.
  registrationDeadline: "2026-10-07T23:59:59+05:30",
  registrationFee: 500,
  minTeamSize: 2,
  maxTeamSize: 7,
  maxFilmDurationMinutes: 3,
  registrationOpen: true,
  submissionOpen: false,
  prizeText: "Attractive Prizes",
  // Proposed, subject to finalization (event-facts §4).
  awardCategories: [
    { key: "best-sdg-storyline", title: "Best Storyline for Sustainable Development Goals", proposed: true },
    { key: "overall-best-film", title: "Overall Best Short Film", proposed: true },
    { key: "best-story-script", title: "Best Story and Script", proposed: true },
    { key: "best-editing-acting", title: "Best Editing and Acting", proposed: true },
  ],
  // Descriptions are the UN goal statements: neutral, no competition rules.
  sdgThemes: [
    {
      number: 9,
      title: "Industry, Innovation and Infrastructure",
      description: "Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation.",
      color: "#F36D25",
    },
    {
      number: 11,
      title: "Sustainable Cities and Communities",
      description: "Make cities and human settlements inclusive, safe, resilient and sustainable.",
      color: "#F99D26",
    },
    {
      number: 12,
      title: "Responsible Consumption and Production",
      description: "Ensure sustainable consumption and production patterns.",
      color: "#6BA43A",
    },
    {
      number: 16,
      title: "Peace, Justice and Strong Institutions",
      description:
        "Promote peaceful and inclusive societies, provide access to justice for all and build effective, accountable and inclusive institutions.",
      color: "#1F7BC4",
    },
  ],
  // Proposed evaluation criteria (event-facts §5). No weights defined.
  evaluationCriteria: [
    { key: "sdg-relevance", title: "Relevance and understanding of the selected SDG" },
    { key: "originality", title: "Originality and creativity of the concept" },
    { key: "story", title: "Quality of story and screenplay" },
    { key: "acting-direction", title: "Acting and direction" },
    { key: "editing-technical", title: "Editing and overall technical execution" },
    { key: "impact", title: "Effectiveness of communication and overall impact" },
  ],
  scoringScale: null,
  paymentInstructions: { text: "", qrImageUrl: null },
};

export const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as SettingKey[];
