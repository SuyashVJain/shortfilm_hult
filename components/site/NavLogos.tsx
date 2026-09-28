import Image from "next/image";

/*
 * Partner logos for the header, sized by their VISIBLE marks.
 * suas-white.png is 5000x1575 with transparent padding; its mark is 4029x849
 * at (473, 393). The layout box below is exactly the mark, and the full,
 * uncropped image overflows it invisibly (only transparent pixels fall outside).
 */
const SUAS = { w: 5000, h: 1575, markW: 4029, markH: 849, left: 473, top: 393 };

function SuasMark({ className }: { className: string }) {
  return (
    <span className={`relative block shrink-0 ${className}`} style={{ aspectRatio: `${SUAS.markW} / ${SUAS.markH}` }}>
      <Image
        src="/logo/suas-white.png"
        alt="Symbiosis University of Applied Sciences"
        width={SUAS.w}
        height={SUAS.h}
        sizes="240px"
        className="absolute h-auto max-w-none"
        style={{
          width: `${(SUAS.w / SUAS.markW) * 100}%`,
          left: `${(-SUAS.left / SUAS.markW) * 100}%`,
          top: `${(-SUAS.top / SUAS.markH) * 100}%`,
        }}
      />
    </span>
  );
}

/**
 * Below 640px: SUAS only. 640–1023px: both. 1024–1279px: SUAS only (room for the links).
 * 1280px up: both. Marks are separated by a fixed 20px gap with a thin divider centred in it.
 */
export function NavLogos() {
  const both = "hidden sm:block lg:hidden xl:block";
  return (
    <span className="flex min-w-0 items-center">
      <SuasMark className="h-5 lg:h-[22px] xl:h-6 2xl:h-7" />
      <span aria-hidden className={`mx-[10px] h-5 w-px shrink-0 bg-divider xl:h-6 ${both}`} />
      <Image
        src="/logo/hult-prize-white.png"
        alt="EF Hult Prize"
        width={1766}
        height={406}
        sizes="140px"
        className={`h-5 w-auto shrink-0 xl:h-6 2xl:h-7 ${both}`}
      />
    </span>
  );
}
