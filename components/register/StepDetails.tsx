import { Field, Input } from "@/components/ui";
import type { StepProps } from "./types";

export function StepDetails({ draft, setDraft, errors, email }: StepProps & { email: string }) {
  const d = draft.details;
  const set = (key: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDraft((x) => ({ ...x, details: { ...x.details, [key]: value } }));
  };
  return (
    <div className="space-y-6">
      <Field label="Team name" error={errors["details.teamName"]}>
        {(p) => <Input {...p} value={d.teamName} onChange={set("teamName")} autoComplete="off" maxLength={60} />}
      </Field>
      <Field label="Team leader name" error={errors["details.leaderName"]}>
        {(p) => <Input {...p} value={d.leaderName} onChange={set("leaderName")} autoComplete="name" maxLength={80} />}
      </Field>
      <Field label="Team leader email" helper="From your verified sign-in. It can't be changed here.">
        {(p) => <Input {...p} value={email} readOnly className="text-cream/70" />}
      </Field>
      <Field label="WhatsApp number" helper="A 10-digit mobile number." error={errors["details.whatsapp"]}>
        {(p) => (
          <Input {...p} type="tel" inputMode="tel" autoComplete="tel" value={d.whatsapp} onChange={set("whatsapp")} />
        )}
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Branch" error={errors["details.branch"]}>
          {(p) => <Input {...p} value={d.branch} onChange={set("branch")} maxLength={80} />}
        </Field>
        <Field label="Semester" error={errors["details.semester"]}>
          {(p) => <Input {...p} value={d.semester} onChange={set("semester")} maxLength={20} />}
        </Field>
      </div>
    </div>
  );
}
