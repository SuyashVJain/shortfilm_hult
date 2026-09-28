"use client";

import { usePathname } from "next/navigation";
import { BackgroundStage } from "@/components/cinema/BackgroundStage";
import { SiteNav } from "./SiteNav";

/** Backdrop dim is per page: bright hero on "/", darker content elsewhere. */
export function PublicBackdrop() {
  const pathname = usePathname();
  return <BackgroundStage dim={pathname === "/" ? "hero" : "content"} />;
}

/** Same nav everywhere; on "/" it overlays the hero. */
export function PublicNav() {
  const pathname = usePathname();
  return <SiteNav overlay={pathname === "/"} />;
}
