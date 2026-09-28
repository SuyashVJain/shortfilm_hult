import { z } from "zod";
import { branchSchema, requiredText, semesterSchema, whatsappSchema } from "./common";

/** Registration step 1. Leader email comes from the verified session, not the form. */
export const teamDetailsSchema = z.object({
  teamName: requiredText("a team name", 60),
  leaderName: requiredText("the team leader's name", 80),
  whatsapp: whatsappSchema,
  branch: branchSchema,
  semester: semesterSchema,
});
export type TeamDetailsInput = z.infer<typeof teamDetailsSchema>;

/** Lowercased, whitespace-collapsed key for case-insensitive team name uniqueness. */
export function teamNameKey(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export const memberSchema = z.object({
  fullName: requiredText("the member's full name", 80),
  branch: branchSchema,
  semester: semesterSchema,
});
export type MemberInput = z.infer<typeof memberSchema>;

/**
 * Registration step 2: the members other than the leader.
 * The leader counts as one, so total = members.length + 1.
 * Bounds come from settings (minTeamSize, maxTeamSize).
 */
export function teamMembersSchema({ minTeamSize, maxTeamSize }: { minTeamSize: number; maxTeamSize: number }) {
  return z
    .array(memberSchema)
    .refine((m) => m.length + 1 >= minTeamSize, {
      message: `A team needs at least ${minTeamSize} members, including the leader.`,
    })
    .refine((m) => m.length + 1 <= maxTeamSize, {
      message: `A team can have at most ${maxTeamSize} members, including the leader.`,
    });
}
