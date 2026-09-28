"use client";

import { usePathname } from "next/navigation";
import { BackgroundStage } from "@/components/cinema/BackgroundStage";
import { HomeAccountLink, SiteNav } from "./SiteNav";

/** Backdrop dim is per page: bright hero on "/", darker content elsewhere. */
export function PublicBackdrop() {
  const pathname = usePathname();
  return <BackgroundStage dim={pathname === "/" ? "hero" : "content"} />;
}

/** Full nav everywhere except "/", which only gets a corner account link. */
export function PublicNav() {
  const pathname = usePathname();
  return pathname === "/" ? <HomeAccountLink /> : <SiteNav />;
}
