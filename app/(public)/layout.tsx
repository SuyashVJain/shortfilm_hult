import { FilmGrain, Vignette } from "@/components/cinema";
import { PublicBackdrop, PublicNav } from "@/components/site/PublicChrome";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Stack: backdrop z-0 -> vignette z-1 -> content z-10 -> nav z-40 -> grain z-50 */}
      <PublicBackdrop />
      <Vignette />
      <FilmGrain />
      <PublicNav />
      <main className="relative z-10">{children}</main>
    </>
  );
}
