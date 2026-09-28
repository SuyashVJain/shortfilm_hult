import type { ComponentProps, ElementType } from "react";

type Props = ComponentProps<"div"> & {
  as?: ElementType;
  /** "wide" for layout, "prose" caps reading width at ~65ch. */
  size?: "wide" | "prose";
};

export function Container({ as: Tag = "div", size = "wide", className = "", ...rest }: Props) {
  const width = size === "prose" ? "max-w-[65ch]" : "max-w-7xl";
  return <Tag className={`mx-auto w-full px-6 sm:px-10 lg:px-16 ${width} ${className}`} {...rest} />;
}
