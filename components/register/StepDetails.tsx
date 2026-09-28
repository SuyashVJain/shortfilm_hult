import { Field, Input, Select } from "@/components/ui";
import { BRANCHES, SEMESTERS } from "@/lib/validation/common";
import type { StepProps } from "./types";

export function StepDetails({ draft, setDraft, errors, email }: StepProps & { email: string }) {
  const d = draft.details;
  const set = (key: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      <Field label="Team leader enrollment number" error={errors["details.enrollmentNumber"]}>
        {(p) => (
          <Input
            {...p}
            value={d.enrollmentNumber}
            onChange={set("enrollmentNumber")}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={40}
          />
        )}
      </Field>
      <Field label="Team leader email" helper="From your verified sign-in. It can't be changed here.">
        {(p) => <Input {...p} value={email} readOnly className="text-cream/70" />}
      </Field>
      <Field label="WhatsApp number" helper="A 10-digit mobile number." error={errors["details.whatsapp"]}>
        {(p) => (
          <Input {...p} type="tel" inputMode="tel" autoComplete="tel" value={d.whatsapp} onChange={set("whatsapp")} />
        )}
      </Field>
      <div className="grid gap-6 sm:grid-cols-[2fr_1fr]">
        <Field label="Branch" error={errors["details.branch"]}>
          {(p) => (
            <Select {...p} value={d.branch} onChange={set("branch")}>
              <option value="" disabled>
                Choose branch
              </option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Semester" error={errors["details.semester"]}>
          {(p) => (
            <Select {...p} value={d.semester} onChange={set("semester")}>
              <option value="" disabled>
                Choose
              </option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
    </div>
  );
}
