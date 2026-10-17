import { PublicBackdrop, PublicNav } from "@/components/site/PublicChrome";

/** Content pages: darker backdrop and an in-flow nav. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicBackdrop />
      <PublicNav />
      <main className="relative z-10">{children}</main>
    </>
  );
}
