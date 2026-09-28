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

/**
 * What the form sends: plain strings (a dropdown value is only a string until
 * validated), so the server action takes this loose shape and validates it.
 */
type Loose<T> = T extends (infer U)[] ? Loose<U>[] : T extends object ? { [K in keyof T]: Loose<T[K]> } : T extends string ? string : T;
export type RegistrationInput = Loose<z.input<ReturnType<typeof registrationSchema>>>;
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
