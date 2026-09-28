import type { RegisterSettings } from "@/app/(public)/register/RegisterClient";

export type { RegisterSettings };

export type MemberDraft = { id: string; fullName: string; branch: string; semester: string };

/** Everything the flow collects. Mirrored to sessionStorage; never holds the OTP. */
export type Draft = {
  step: number;
  details: { teamName: string; leaderName: string; whatsapp: string; branch: string; semester: string };
  members: MemberDraft[];
  film: { sdg: number | null; filmTitle: string; synopsis: string; sdgApproach: string };
  payment: { utr: string; screenshotUrl: string };
};

export type Errors = Record<string, string>;

export type StepProps = {
  draft: Draft;
  setDraft: (update: (d: Draft) => Draft) => void;
  errors: Errors;
  settings: RegisterSettings;
};

export const EMPTY_DRAFT: Draft = {
  step: 1,
  details: { teamName: "", leaderName: "", whatsapp: "", branch: "", semester: "" },
  members: [],
  film: { sdg: null, filmTitle: "", synopsis: "", sdgApproach: "" },
  payment: { utr: "", screenshotUrl: "" },
};

export const STEPS = [
  { label: "Verify" },
  { label: "Team" },
  { label: "Members" },
  { label: "Film" },
  { label: "Payment" },
  { label: "Review" },
];
