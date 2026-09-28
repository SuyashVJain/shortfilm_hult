import { z } from "zod";
import { filmIdeaSchema } from "./film";
import { paymentSchema } from "./payment";
import { teamDetailsSchema, teamMembersSchema } from "./team";

/** Values the registration schemas need, taken from settings. */
export type RegistrationRules = { minTeamSize: number; maxTeamSize: number; sdgNumbers: number[] };

/** The whole registration payload. Used by the client per step and by the server action in full. */
export function registrationSchema(rules: RegistrationRules) {
  return z.object({
    details: teamDetailsSchema,
    members: teamMembersSchema(rules),
    film: filmIdeaSchema(rules.sdgNumbers),
    payment: paymentSchema,
  });
}

export type RegistrationInput = z.input<ReturnType<typeof registrationSchema>>;
export type RegistrationData = z.output<ReturnType<typeof registrationSchema>>;

/** Flatten Zod issues to { "details.teamName": "message" } (first message per path). */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
