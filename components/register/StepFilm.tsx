import { Field, FormNotice, Input, Textarea } from "@/components/ui";
import { FILM_LIMITS } from "@/lib/validation/film";
import type { StepProps } from "./types";

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span className={value.length > max ? "text-red" : undefined}>
      {value.length} / {max} characters
    </span>
  );
}

export function StepFilm({ draft, setDraft, errors, settings }: StepProps) {
  const f = draft.film;
  const set = (key: "filmTitle" | "synopsis" | "sdgApproach") => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDraft((x) => ({ ...x, film: { ...x.film, [key]: value } }));
  };

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-cream-muted">Select SDG</legend>
        <div role="radiogroup" aria-label="Select SDG" className="grid gap-3 sm:grid-cols-2">
          {settings.sdgThemes.map((t) => {
            const selected = f.sdg === t.number;
            return (
              <button
                key={t.number}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setDraft((x) => ({ ...x, film: { ...x.film, sdg: t.number } }))}
                className={`relative min-h-24 border px-5 py-4 text-left transition-colors ${
                  selected ? "bg-charcoal-2" : "bg-charcoal/60 hover:bg-charcoal-2"
                }`}
                style={{ borderColor: selected ? t.color : `${t.color}55`, borderWidth: selected ? 2 : 1 }}
              >
                <span className="block font-display text-4xl leading-none" style={{ color: t.color }}>
                  {String(t.number).padStart(2, "0")}
                </span>
                <span className="mt-2 block text-sm text-cream">{t.title}</span>
                {/* Selection is shown with text and a mark, not colour alone */}
                {selected && (
                  <span className="absolute top-3 right-4 text-[0.65rem] uppercase tracking-[0.2em] text-cream">✓ Selected</span>
                )}
              </button>
            );
          })}
        </div>
        {errors["film.sdg"] && <FormNotice tone="error" className="mt-3">{errors["film.sdg"]}</FormNotice>}
      </fieldset>

      <Field label="Working film title" helper={<Counter value={f.filmTitle} max={FILM_LIMITS.title} />} error={errors["film.filmTitle"]}>
        {(p) => <Input {...p} value={f.filmTitle} onChange={set("filmTitle")} />}
      </Field>
      <Field label="Short synopsis" helper={<Counter value={f.synopsis} max={FILM_LIMITS.synopsis} />} error={errors["film.synopsis"]}>
        {(p) => <Textarea {...p} value={f.synopsis} onChange={set("synopsis")} rows={4} />}
      </Field>
      <Field
        label="How does your film address the selected SDG?"
        helper={<Counter value={f.sdgApproach} max={FILM_LIMITS.sdgApproach} />}
        error={errors["film.sdgApproach"]}
      >
        {(p) => <Textarea {...p} value={f.sdgApproach} onChange={set("sdgApproach")} rows={4} />}
      </Field>
    </div>
  );
}
