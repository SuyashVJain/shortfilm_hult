import { FilmGrain, Vignette } from "@/components/cinema";

/*
 * Stack: backdrop z-0 -> vignette z-1 -> content z-10 -> nav z-40 -> grain z-50.
 * Backdrop and nav come from the home page or the (site) layout.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Vignette />
      <FilmGrain />
      {children}
    </>
  );
}
