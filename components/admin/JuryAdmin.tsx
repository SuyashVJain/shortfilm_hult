"use client";

import { useState, useTransition, type ReactNode } from "react";
import {
  assignTeamLocation,
  createJuryAccount,
  createLocation,
  setJuryActive,
  unlockEvaluation,
  type JuryAdminResult,
} from "@/app/(admin)/admin/jury/actions";
import { Field, Input, Select } from "@/components/ui";

function Result({ r }: { r: JuryAdminResult | null }) {
  if (!r) return null;
  return (
    <p role={r.ok ? "status" : "alert"} className={`text-sm ${r.ok ? "text-cream/80" : "text-[#ff6b77]"}`}>
      {r.ok ? `✓ ${r.message}` : r.error}
    </p>
  );
}

const saveBtn =
  "min-h-11 bg-cream px-5 text-xs font-semibold uppercase tracking-[0.18em] text-bg transition-colors hover:bg-white disabled:opacity-40";

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-divider bg-charcoal p-5 sm:p-6">
      <h2 className="text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function NewLocationForm() {
  const [name, setName] = useState("");
  const [r, setR] = useState<JuryAdminResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <Panel title="New location">
      <form
        noValidate
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await createLocation(name);
            setR(res);
            if (res.ok) setName("");
          });
        }}
      >
        <Field label="Name" helper="For example: Room A, Online Panel 1">
          {(p) => <Input {...p} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={pending} className={saveBtn}>
            {pending ? "Saving…" : "Add location"}
          </button>
          <Result r={r} />
        </div>
      </form>
    </Panel>
  );
}

export function NewJuryAccountForm({ locations }: { locations: { id: string; name: string }[] }) {
  const empty = { username: "", password: "", displayName: "", locationId: "" };
  const [v, setV] = useState(empty);
  const [r, setR] = useState<JuryAdminResult | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV((x) => ({ ...x, [k]: e.target.value }));
  return (
    <Panel title="New jury account">
      <form
        noValidate
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await createJuryAccount(v);
            setR(res);
            if (res.ok) setV(empty); // clear the password from memory/state
          });
        }}
      >
        <Field label="Juror name">{(p) => <Input {...p} value={v.displayName} maxLength={80} onChange={set("displayName")} />}</Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Jury ID (username)">
            {(p) => <Input {...p} value={v.username} autoComplete="off" autoCapitalize="none" spellCheck={false} onChange={set("username")} />}
          </Field>
          <Field label="Password" helper="At least 8 characters. Share it with the juror privately.">
            {(p) => <Input {...p} type="password" value={v.password} autoComplete="new-password" onChange={set("password")} />}
          </Field>
        </div>
        <Field label="Location">
          {(p) => (
            <Select {...p} value={v.locationId} onChange={set("locationId")}>
              <option value="" disabled>
                Choose location
              </option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={pending || locations.length === 0} className={saveBtn}>
            {pending ? "Saving…" : "Create account"}
          </button>
          <Result r={r} />
        </div>
      </form>
    </Panel>
  );
}

export function JuryActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [r, setR] = useState<JuryAdminResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <span className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => setR(await setJuryActive(id, !active)))}
        className="min-h-9 border border-cream/35 px-3 text-xs uppercase tracking-[0.16em] text-cream hover:border-cream disabled:opacity-40"
      >
        {active ? "Deactivate" : "Reactivate"}
      </button>
      <Result r={r} />
    </span>
  );
}

export function TeamLocationSelect({ teamId, locationId, locations }: { teamId: string; locationId: string; locations: { id: string; name: string }[] }) {
  const [value, setValue] = useState(locationId);
  const [r, setR] = useState<JuryAdminResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <span className="flex flex-wrap items-center gap-3">
      <select
        aria-label="Judging location"
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          start(async () => setR(await assignTeamLocation(teamId, next)));
        }}
        className="min-h-9 rounded-sm border border-cream/25 bg-charcoal px-2 text-sm text-cream focus:border-red focus:outline-none"
      >
        <option value="">Not assigned</option>
        {locations.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>
      <Result r={r} />
    </span>
  );
}

export function UnlockEvaluationButton({ id }: { id: string }) {
  const [r, setR] = useState<JuryAdminResult | null>(null);
  const [pending, start] = useTransition();
  if (r?.ok) return <Result r={r} />;
  return (
    <span className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => setR(await unlockEvaluation(id)))}
        className="min-h-9 border border-red/60 px-3 text-xs uppercase tracking-[0.16em] text-cream hover:bg-red/15 disabled:opacity-40"
      >
        {pending ? "Unlocking…" : "Unlock for correction"}
      </button>
      <Result r={r} />
    </span>
  );
}
