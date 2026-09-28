// Shared by server and client. Payment is optimistic: status is a review flag, not an access gate.

export const PAYMENT_STATUSES = ["PENDING", "VERIFIED", "REJECTED"] as const;
export type PaymentStatusValue = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_LABEL: Record<PaymentStatusValue, string> = {
  PENDING: "Needs review",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

export const PAYMENT_TONE: Record<PaymentStatusValue, "pending" | "ok" | "bad"> = {
  PENDING: "pending",
  VERIFIED: "ok",
  REJECTED: "bad",
};

export const SUBMISSION_LABEL = {
  NOT_SUBMITTED: "Not submitted",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
} as const;

/** Film submission is blocked only while the latest payment is REJECTED. */
export function canSubmitFilm(latest: PaymentStatusValue | null | undefined) {
  return latest !== "REJECTED";
}
