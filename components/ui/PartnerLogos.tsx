import Image from "next/image";

type Props = {
  className?: string;
  suasClassName?: string;
  hultClassName?: string;
  ruleClassName?: string;
};

/**
 * Official white partner logos, used exactly as supplied (no recolour or crop).
 * The SUAS file carries wide transparent padding, so its box is taller than the
 * Hult Prize box to give both marks a similar visible height.
 */
export function PartnerLogos({
  className = "",
  suasClassName = "h-12 sm:h-[72px]",
  hultClassName = "h-7 sm:h-10",
  ruleClassName = "h-8 sm:h-10",
}: Props) {
  return (
    <div className={`flex items-center justify-center gap-4 sm:gap-6 ${className}`}>
      <Image
        src="/logo/suas-white.png"
        alt="Symbiosis University of Applied Sciences"
        width={5000}
        height={1575}
        sizes="(min-width: 640px) 240px, 160px"
        className={`w-auto ${suasClassName}`}
      />
      <span aria-hidden className={`w-px bg-divider ${ruleClassName}`} />
      <Image
        src="/logo/hult-prize-white.png"
        alt="EF Hult Prize"
        width={1766}
        height={406}
        sizes="(min-width: 640px) 190px, 130px"
        className={`w-auto ${hultClassName}`}
      />
    </div>
  );
}
