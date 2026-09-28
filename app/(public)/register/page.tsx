import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicFooter } from "@/components/site/PublicFooter";
import { Container, SectionHeading } from "@/components/ui";
import { db } from "@/lib/db";
import { getSession } from "@/lib/guards";
import { homeForRole, toRole } from "@/lib/roles";
import { getSettings, isRegistrationOpen } from "@/lib/settings";
import { RegisterClient, type RegisterSettings } from "./RegisterClient";

export const metadata: Metadata = { title: "Register | Short Film Competition" };

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Container className="max-w-3xl py-[8dvh]">{children}</Container>
      <PublicFooter />
    </>
  );
}

export default async function RegisterPage() {
  const session = await getSession();

  if (session) {
    const role = toRole(session.user.role);
    if (role !== "PARTICIPANT") {
      return (
        <Frame>
          <SectionHeading as="h1" label="Registration" title="For team leaders" />
          <p className="mt-8 max-w-prose text-cream/75">
            Registration is for team leaders. You&rsquo;re signed in with a {role.toLowerCase()} account.
          </p>
          <Link href={homeForRole(role)} className="mt-6 inline-flex min-h-12 items-center text-sm uppercase tracking-[0.24em] text-cream underline underline-offset-4">
            Go to your area
          </Link>
        </Frame>
      );
    }
    if (await db.team.findUnique({ where: { leaderId: session.user.id }, select: { id: true } })) redirect("/dashboard");
  }

  if (!(await isRegistrationOpen())) {
    return (
      <Frame>
        <SectionHeading as="h1" label="Registration" title="Registration is closed" />
        <p className="mt-8 max-w-prose text-cream/75">
          We&rsquo;re not accepting new teams right now. Registered teams can still sign in to their dashboard.
        </p>
      </Frame>
    );
  }

  const s = await getSettings();
  const settings: RegisterSettings = {
    registrationFee: s.registrationFee,
    minTeamSize: s.minTeamSize,
    maxTeamSize: s.maxTeamSize,
    sdgThemes: s.sdgThemes,
    paymentInstructions: s.paymentInstructions,
  };

  return (
    <Frame>
      <SectionHeading as="h1" label="Real stories | Brighter tomorrows" title="Register your team" />
      <RegisterClient email={session?.user.email ?? null} settings={settings} />
    </Frame>
  );
}
