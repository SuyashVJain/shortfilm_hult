import type { Metadata, Viewport } from "next";
import { Anton, Inter, Yellowtail } from "next/font/google";
import { Loader, PageShell, loaderBootScript } from "@/components/cinema";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const yellowtail = Yellowtail({
  variable: "--font-yellowtail",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Short Film Competition | Hult Prize @ SUAS",
  description:
    "Real stories. Brighter tomorrows. A short film competition around four UN Sustainable Development Goals, by Hult Prize @ SUAS.",
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the boot script may set data-loader before hydration.
    <html
      lang="en"
      className={`${anton.variable} ${yellowtail.variable} ${inter.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: loaderBootScript }} />
        <noscript>
          <style>{`#cinema-loader{display:none}body{overflow:auto!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-dvh text-cream">
        <PageShell>{children}</PageShell>
        <Loader />
      </body>
    </html>
  );
}
