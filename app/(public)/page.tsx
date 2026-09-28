import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { HomeSections } from "@/components/home/HomeSections";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Short Film Competition | Hult Prize @ SUAS",
  description:
    "Real stories. Brighter tomorrows. A short film competition around four UN Sustainable Development Goals, by Hult Prize @ SUAS.",
  // Hidden until prizes are announced. Restore by appending to the description above: " Attractive prizes."
};

export default async function HomePage() {
  const settings = await getSettings();
  return (
    <>
      <Hero />
      <HomeSections settings={settings} />
    </>
  );
}
