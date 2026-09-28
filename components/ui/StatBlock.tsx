/** Huge numeral plus a tiny tracked caption. */
export function StatBlock({ value, label, className = "" }: { value: React.ReactNode; label: string; className?: string }) {
  return (
    <div className={`border-t border-divider pt-4 ${className}`}>
      <p className="font-display text-5xl leading-none text-cream tabular-nums">{value}</p>
      <p className="mt-2 text-[0.65rem] uppercase tracking-[0.24em] text-cream-muted">{label}</p>
    </div>
  );
}
