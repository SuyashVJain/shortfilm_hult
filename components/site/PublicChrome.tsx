import { BackgroundStage } from "@/components/cinema/BackgroundStage";
import { SiteNav } from "./SiteNav";

/*
 * Home vs content chrome is chosen by the route (home page vs the (site) layout),
 * never by usePathname: Vercel's cached render of "/" can see a different pathname
 * than the browser, which caused a hydration mismatch on the live home page.
 */

/** Backdrop dim is per page: bright hero on "/", darker content elsewhere. */
export function PublicBackdrop({ home = false }: { home?: boolean }) {
  return <BackgroundStage dim={home ? "hero" : "content"} />;
}

/** Same nav everywhere; on "/" it overlays the hero. */
export function PublicNav({ home = false }: { home?: boolean }) {
  return <SiteNav overlay={home} />;
}
