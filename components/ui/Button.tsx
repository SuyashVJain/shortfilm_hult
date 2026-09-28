import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary";

const base =
  "inline-flex min-h-12 items-center justify-center rounded-sm px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.28em] transition-[background-color,border-color,color,box-shadow] duration-500 ease-[var(--ease-cinema)] disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary:
    "bg-red text-cream hover:bg-[#ee2a3b] hover:shadow-[0_0_40px_-8px_rgb(225_29_46/0.6)]",
  secondary:
    "border border-cream/60 text-cream hover:border-cream hover:bg-cream/[0.06]",
};

export function buttonClasses(variant: Variant = "primary", className = "") {
  return `${base} ${variants[variant]} ${className}`;
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant };

export function Button({ variant = "primary", className, ...rest }: ButtonProps) {
  return <button className={buttonClasses(variant, className)} {...rest} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant };

export function ButtonLink({ variant = "primary", className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, className)} {...rest} />;
}
