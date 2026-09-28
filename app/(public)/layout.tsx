import { BackgroundStage, FilmGrain, Vignette } from "@/components/cinema";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Stack: backdrop z-0 -> vignette z-1 -> content z-10 -> grain z-50 */}
      <BackgroundStage dim="hero" />
      <Vignette />
      <FilmGrain />
      <main className="relative z-10">{children}</main>
    </>
  );
}
