type Props = {
  className?: string;
  /** 0–1. Keep low; this is used sparingly. */
  intensity?: number;
};

/** Soft amber glow, positioned by the parent (behind titles, at transitions). */
export function LightLeak({ className = "", intensity = 0.35 }: Props) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute blur-3xl ${className}`}
      style={{
        opacity: intensity,
        background:
          "radial-gradient(ellipse at center, rgb(245 158 11 / 0.55) 0%, rgb(225 29 46 / 0.18) 40%, transparent 70%)",
      }}
    />
  );
}
