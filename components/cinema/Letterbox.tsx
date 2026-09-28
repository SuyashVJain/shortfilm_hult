/** Thin black cinema bars at the top and bottom of the parent section. */
export function Letterbox({ size = "clamp(12px, 3vh, 36px)" }: { size?: string }) {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-black" style={{ height: size }} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-black" style={{ height: size }} />
    </>
  );
}
