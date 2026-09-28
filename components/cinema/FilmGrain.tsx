/**
 * Fixed full-viewport grain. Static noise tile at very low opacity; the
 * animation only steps background-position (cheap, no large transformed
 * layer). Static under reduced motion. Decorative only.
 */
const noise =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function FilmGrain({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="film-grain pointer-events-none fixed inset-0 z-50"
      style={{ backgroundImage: noise, backgroundSize: "200px 200px", opacity }}
    />
  );
}
