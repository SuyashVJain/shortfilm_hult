import { ButtonLink } from "@/components/ui";

type Props = { teamCode: string; email: string; emailSent: boolean };

export function Confirmation({ teamCode, email, emailSent }: Props) {
  return (
    <div className="mt-12" role="status">
      <p className="text-[0.7rem] uppercase tracking-label text-red">Registration received</p>
      <p className="mt-4 text-lg text-cream/85">Your registration has been successfully submitted.</p>

      <p className="mt-10 text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">Team ID</p>
      <p className="mt-1 font-display text-[clamp(3rem,14vw,5.5rem)] leading-none text-cream">{teamCode}</p>

      <dl className="mt-8 space-y-2 text-sm">
        <div className="grid grid-cols-[8.5rem_1fr] gap-3">
          <dt className="uppercase tracking-[0.16em] text-cream/50">Payment</dt>
          <dd className="text-cream">Needs review</dd>
        </div>
      </dl>

      <p className="mt-8 text-sm text-cream/80">
        The organisers will check your payment. You can already use your team dashboard.
      </p>
      <p className="mt-3 text-sm text-cream/65">
        {emailSent
          ? `A confirmation email with your Team ID was sent to ${email}.`
          : "We couldn't send the confirmation email, but your registration is saved. Note your Team ID above."}
      </p>

      <ButtonLink href="/dashboard" className="mt-10 w-full sm:w-auto">
        Go to dashboard
      </ButtonLink>
    </div>
  );
}
