import type { Metadata, Viewport } from "next";
import { Anton, Inter, Yellowtail } from "next/font/google";
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
    <html
      lang="en"
      className={`${anton.variable} ${yellowtail.variable} ${inter.variable} antialiased`}
    >
      <body className="min-h-dvh bg-bg text-cream">{children}</body>
    </html>
  );
}
