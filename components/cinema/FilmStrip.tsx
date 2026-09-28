/**
 * Horizontal film strip with sprocket holes, drifting very slowly (90s loop).
 * Use at most once between major sections.
 */
function Frames() {
  return (
    <div className="flex shrink-0">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="flex h-16 w-28 shrink-0 flex-col justify-between border-r border-cream/10 py-1.5 sm:h-20 sm:w-36">
          <Sprockets />
          <div className="mx-2 h-6 bg-charcoal-2/80 sm:h-9" />
          <Sprockets />
        </div>
      ))}
    </div>
  );
}

function Sprockets() {
  return (
    <div className="flex justify-around px-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="h-1.5 w-2.5 rounded-[1px] bg-cream/15" />
      ))}
    </div>
  );
}

export function FilmStrip({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`relative overflow-hidden border-y border-divider bg-black/80 ${className}`}>
      <div className="flex w-max animate-strip motion-reduce:animate-none">
        <Frames />
        <Frames />
      </div>
    </div>
  );
}
