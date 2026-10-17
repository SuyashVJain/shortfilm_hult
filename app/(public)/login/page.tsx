import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicFooter } from "@/components/site/PublicFooter";
import { Container } from "@/components/ui";
import { getSession } from "@/lib/guards";
import { homeForRole, safeNext, toRole } from "@/lib/roles";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Login | Short Film Competition",
  description: "Sign in with your email and password, or with a one-time email code.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const nextPath = safeNext(typeof next === "string" ? next : null);

  // Already signed in: go straight on.
  const session = await getSession();
  if (session) redirect(nextPath ?? homeForRole(toRole(session.user.role)));

  return (
    <>
      <Container size="prose" className="flex min-h-[calc(100dvh-5.5rem)] flex-col justify-center py-12">
        <p className="text-[0.7rem] font-medium uppercase tracking-label text-cream-muted">Team leaders and organisers</p>
        <h1 className="mt-4 font-display text-6xl uppercase leading-[0.9] text-cream sm:text-7xl">Login</h1>
        <p className="mt-5 max-w-md text-cream/70">Sign in with your email and password, or with a one-time code sent to your email.</p>
        <LoginForm next={nextPath} />
        <p className="mt-6 text-sm text-cream/55">
          Jury member?{" "}
          <Link href="/jury/login" className="text-cream/80 underline underline-offset-4 hover:text-cream">
            Sign in to the jury panel
          </Link>
        </p>
      </Container>
      <PublicFooter />
    </>
  );
}
