"use client";

import { useState, useTransition, type ReactNode } from "react";
import {
  saveFilm,
  savePaymentInstructions,
  savePrizeText,
  saveRegistration,
  saveTeamSize,
  type SettingsResult,
} from "@/app/(admin)/admin/settings/actions";
import { Field, Input, Textarea } from "@/components/ui";

/** One settings group: its own form, its own save, inline result. */
function Group({
  title,
  description,
  onSave,
  children,
}: {
  title: string;
  description?: ReactNode;
  onSave: () => Promise<SettingsResult>;
  children: ReactNode;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<SettingsResult | null>(null);
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setResult(null);
        start(async () => setResult(await onSave()));
      }}
      className="border border-divider bg-charcoal p-5 sm:p-6"
    >
      <h2 className="text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">{title}</h2>
      {description && <div className="mt-2 text-sm text-cream/60">{description}</div>}
      <div className="mt-5 space-y-5">{children}</div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 bg-cream px-5 text-xs font-semibold uppercase tracking-[0.18em] text-bg transition-colors hover:bg-white disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <p aria-live="polite" className={`text-sm ${result && !result.ok ? "text-[#ff6b77]" : "text-cream/80"}`}>
          {result ? (result.ok ? `✓ ${result.message}` : result.error) : null}
        </p>
      </div>
    </form>
  );
}

function Toggle({ label, checked, onChange, help }: { label: string; checked: boolean; onChange: (v: boolean) => void; help: string }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-5 shrink-0 accent-red"
      />
      <span>
        <span className="block text-sm text-cream">
          {label}: <strong className="font-semibold">{checked ? "On" : "Off"}</strong>
        </span>
        <span className="block text-sm text-cream/55">{help}</span>
      </span>
    </label>
  );
}

export type SettingsFormValues = {
  deadlineLocal: string; // yyyy-mm-ddThh:mm:ss in India time
  registrationOpen: boolean;
  registrationFee: number;
  minTeamSize: number;
  maxTeamSize: number;
  maxFilmDurationMinutes: number;
  submissionOpen: boolean;
  paymentText: string;
  qrImageUrl: string;
  prizeText: string;
};

export function SettingsForms({ initial }: { initial: SettingsFormValues }) {
  const [v, setV] = useState(initial);
  const set = <K extends keyof SettingsFormValues>(key: K) => (value: SettingsFormValues[K]) =>
    setV((x) => ({ ...x, [key]: value }));
  const num = (key: "registrationFee" | "minTeamSize" | "maxTeamSize" | "maxFilmDurationMinutes") =>
    (e: React.ChangeEvent<HTMLInputElement>) => set(key)(e.target.value === "" ? Number.NaN : Number(e.target.value));

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Group
        title="Registration"
        description="Registration is open only while the switch is on and the deadline has not passed."
        onSave={() => saveRegistration({ deadlineLocal: v.deadlineLocal, registrationOpen: v.registrationOpen, registrationFee: v.registrationFee })}
      >
        <Field label="Deadline (India time, IST)">
          {(p) => <Input {...p} type="datetime-local" step={1} value={v.deadlineLocal} onChange={(e) => set("deadlineLocal")(e.target.value)} />}
        </Field>
        <Toggle label="Registration open" checked={v.registrationOpen} onChange={set("registrationOpen")} help="Turn off to close registration now." />
        <Field label="Registration fee (₹ per team)">
          {(p) => <Input {...p} type="number" inputMode="numeric" min={0} step={1} value={Number.isNaN(v.registrationFee) ? "" : v.registrationFee} onChange={num("registrationFee")} />}
        </Field>
      </Group>

      <Group
        title="Team size"
        description="Counts the team leader. Applies to new registrations and to team edits."
        onSave={() => saveTeamSize({ minTeamSize: v.minTeamSize, maxTeamSize: v.maxTeamSize })}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Minimum members">
            {(p) => <Input {...p} type="number" inputMode="numeric" min={1} step={1} value={Number.isNaN(v.minTeamSize) ? "" : v.minTeamSize} onChange={num("minTeamSize")} />}
          </Field>
          <Field label="Maximum members">
            {(p) => <Input {...p} type="number" inputMode="numeric" min={1} step={1} value={Number.isNaN(v.maxTeamSize) ? "" : v.maxTeamSize} onChange={num("maxTeamSize")} />}
          </Field>
        </div>
      </Group>

      <Group title="Film" onSave={() => saveFilm({ maxFilmDurationMinutes: v.maxFilmDurationMinutes, submissionOpen: v.submissionOpen })}>
        <Field label="Maximum film duration (minutes)">
          {(p) => <Input {...p} type="number" inputMode="decimal" min={0} step="any" value={Number.isNaN(v.maxFilmDurationMinutes) ? "" : v.maxFilmDurationMinutes} onChange={num("maxFilmDurationMinutes")} />}
        </Field>
        <Toggle label="Film submission open" checked={v.submissionOpen} onChange={set("submissionOpen")} help="Shows as open on team dashboards." />
      </Group>

      <Group
        title="Prize text"
        description="Prize mentions are currently commented out on the public pages, so this value is not shown anywhere until they are restored. Never include an amount."
        onSave={() => savePrizeText({ prizeText: v.prizeText })}
      >
        <Field label="Prize text">
          {(p) => <Input {...p} value={v.prizeText} maxLength={80} onChange={(e) => set("prizeText")(e.target.value)} />}
        </Field>
      </Group>

      <div className="lg:col-span-2">
        <Group
          title="Payment instructions"
          description="Shown on the payment step of registration and when a team resubmits payment."
          onSave={() => savePaymentInstructions({ text: v.paymentText, qrImageUrl: v.qrImageUrl })}
        >
          <Field label="Instructions text" helper="Leave empty to show “Payment details will be shared.”">
            {(p) => <Textarea {...p} rows={4} maxLength={2000} value={v.paymentText} onChange={(e) => set("paymentText")(e.target.value)} />}
          </Field>
          <Field label="QR image" helper="A site path such as /pay/payment_suyash.jpg, or an https link. Leave empty for no QR.">
            {(p) => <Input {...p} value={v.qrImageUrl} spellCheck={false} onChange={(e) => set("qrImageUrl")(e.target.value)} />}
          </Field>
        </Group>
      </div>
    </div>
  );
}
