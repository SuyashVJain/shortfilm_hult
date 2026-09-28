import { BackgroundStage, FilmGrain, Vignette } from "@/components/cinema";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BackgroundStage />
      <Vignette />
      <FilmGrain />
      <main className="relative z-10">{children}</main>
    </>
  );
}
