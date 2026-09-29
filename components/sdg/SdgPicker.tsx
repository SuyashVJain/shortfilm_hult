"use client";

import type { SdgTheme } from "@/lib/settings-defaults";

type Props = {
  themes: SdgTheme[];
  value: number | null;
  onChange: (sdg: number) => void;
  error?: string | null;
  label?: string;
};

/** Four selectable SDG tiles. Selection is shown with a mark and text, not colour alone. */
export function SdgPicker({ themes, value, onChange, error, label = "Select SDG" }: Props) {
  return (
    <fieldset>
      <legend className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-cream-muted">{label}</legend>
      <div role="radiogroup" aria-label={label} className="grid gap-3 sm:grid-cols-2">
        {themes.map((t) => {
          const selected = value === t.number;
          return (
            <button
              key={t.number}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(t.number)}
              className={`relative min-h-24 border px-5 py-4 text-left transition-colors ${
                selected ? "bg-charcoal-2" : "bg-charcoal/60 hover:bg-charcoal-2"
              }`}
              style={{ borderColor: selected ? t.color : `${t.color}55`, borderWidth: selected ? 2 : 1 }}
            >
              <span className="block font-display text-4xl leading-none" style={{ color: t.color }}>
                {String(t.number).padStart(2, "0")}
              </span>
              <span className="mt-2 block pr-20 text-sm text-cream">{t.title}</span>
              {selected && (
                <span className="absolute top-3 right-4 text-[0.65rem] uppercase tracking-[0.2em] text-cream">✓ Selected</span>
              )}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red">
          {error}
        </p>
      )}
    </fieldset>
  );
}
