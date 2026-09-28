"use client";

import dynamic from "next/dynamic";
import type { SdgTheme, Settings } from "@/lib/settings-defaults";

export type RegisterSettings = {
  registrationFee: number;
  minTeamSize: number;
  maxTeamSize: number;
  sdgThemes: SdgTheme[];
  paymentInstructions: Settings["paymentInstructions"];
};

// Client-only so the saved draft can be read from sessionStorage on first
// render without a hydration mismatch.
const RegisterFlow = dynamic(() => import("@/components/register/RegisterFlow").then((m) => m.RegisterFlow), {
  ssr: false,
  loading: () => <div className="mt-12 h-64" aria-busy="true" />,
});

export function RegisterClient(props: { email: string | null; settings: RegisterSettings }) {
  return <RegisterFlow {...props} />;
}
