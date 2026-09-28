type Tone = "pending" | "ok" | "bad" | "neutral";

const TONES: Record<Tone, string> = {
  pending: "border-amber/50 text-amber",
  ok: "border-[#7fae7a]/50 text-[#9cc497]",
  bad: "border-red/60 text-[#ff6b77]",
  neutral: "border-cream/25 text-cream/75",
};

const DOTS: Record<Tone, string> = { pending: "○", ok: "✓", bad: "✕", neutral: "·" };

/** Small status pill. Always a text label; colour and symbol are extra cues. */
export function StatusBadge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      <span aria-hidden>{DOTS[tone]}</span>
      {children}
    </span>
  );
}
