import { Field, FormNotice, Input } from "@/components/ui";
import type { MemberDraft, StepProps } from "./types";

function newMember(): MemberDraft {
  return { id: crypto.randomUUID(), fullName: "", branch: "", semester: "" };
}

export function StepMembers({ draft, setDraft, errors, settings }: StepProps) {
  const { minTeamSize, maxTeamSize } = settings;
  const size = draft.members.length + 1; // leader counts as one
  const atMax = size >= maxTeamSize;

  const update = (id: string, key: keyof Omit<MemberDraft, "id">, value: string) =>
    setDraft((x) => ({ ...x, members: x.members.map((m) => (m.id === id ? { ...m, [key]: value } : m)) }));
  const remove = (id: string) => setDraft((x) => ({ ...x, members: x.members.filter((m) => m.id !== id) }));
  const add = () => setDraft((x) => ({ ...x, members: [...x.members, newMember()] }));

  return (
    <div className="space-y-6">
      <p className="text-sm text-cream/75" aria-live="polite">
        Team size: <span className="font-semibold text-cream">{size}</span> of {minTeamSize}–{maxTeamSize}
      </p>

      {/* Member 1: the leader, locked */}
      <div className="border border-divider bg-charcoal/60 px-5 py-4">
        <p className="text-[0.65rem] uppercase tracking-[0.24em] text-red">Member 1 · Team Leader</p>
        <p className="mt-2 text-cream">{draft.details.leaderName || "Team leader"}</p>
        <p className="text-sm text-cream/60">
          {[draft.details.branch, draft.details.semester && `Semester ${draft.details.semester}`].filter(Boolean).join(" · ")}
        </p>
      </div>

      {draft.members.map((m, i) => (
        <fieldset key={m.id} className="border border-divider px-5 pt-4 pb-5">
          <legend className="px-2 text-[0.65rem] uppercase tracking-[0.24em] text-cream-muted">Member {i + 2}</legend>
          <div className="space-y-5">
            <Field label="Full name" error={errors[`members.${i}.fullName`]}>
              {(p) => <Input {...p} value={m.fullName} onChange={(e) => update(m.id, "fullName", e.target.value)} maxLength={80} />}
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Branch" error={errors[`members.${i}.branch`]}>
                {(p) => <Input {...p} value={m.branch} onChange={(e) => update(m.id, "branch", e.target.value)} maxLength={80} />}
              </Field>
              <Field label="Semester" error={errors[`members.${i}.semester`]}>
                {(p) => <Input {...p} value={m.semester} onChange={(e) => update(m.id, "semester", e.target.value)} maxLength={20} />}
              </Field>
            </div>
            <button
              type="button"
              onClick={() => remove(m.id)}
              className="min-h-12 text-sm text-cream/60 underline underline-offset-4 hover:text-red"
            >
              Remove member {i + 2}
            </button>
          </div>
        </fieldset>
      ))}

      {errors.members && <FormNotice tone="error">{errors.members}</FormNotice>}

      <div>
        <button
          type="button"
          onClick={add}
          disabled={atMax}
          className="min-h-12 w-full border border-dashed border-cream/35 px-5 text-xs uppercase tracking-[0.24em] text-cream transition-colors hover:border-cream disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          + Add member
        </button>
        {atMax && (
          <p className="mt-2 text-sm text-cream/60">A team can have at most {maxTeamSize} members, including the leader.</p>
        )}
      </div>
    </div>
  );
}
