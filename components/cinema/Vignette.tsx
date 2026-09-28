/** Fixed radial darkening at the edges of the frame. */
export function Vignette() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-1"
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 45%, rgb(5 5 5 / 0.55) 80%, rgb(5 5 5 / 0.9) 100%)",
      }}
    />
  );
}
