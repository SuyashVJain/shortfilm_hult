import { Divider } from "./Divider";

type Props = {
  label: string;
  title: string;
  as?: "h1" | "h2" | "h3";
  divider?: boolean;
  className?: string;
};

/** Small tracked label above a large display title. */
export function SectionHeading({ label, title, as: Tag = "h2", divider = false, className = "" }: Props) {
  return (
    <div className={className}>
      <p className="text-[0.7rem] font-medium uppercase tracking-[var(--tracking-label)] text-cream-muted">{label}</p>
      <Tag className="mt-4 font-display text-5xl uppercase leading-[0.9] text-cream sm:text-6xl lg:text-7xl">{title}</Tag>
      {divider && <Divider className="mt-8" />}
    </div>
  );
}
