"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button, Field, FormNotice, Input } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { homeForRole, toRole } from "@/lib/roles";

const emailSchema = z.email({ error: "Please enter a valid email address." });
const codeSchema = z.string().regex(/^\d{6}$/, { error: "Please enter the 6-digit code from the email." });

const RESEND_SECONDS = 60;

type AuthError = { status?: number; code?: string } | null | undefined;

/** Plain-language messages. Never reveals whether an account exists. */
function friendly(error: AuthError, step: "send" | "verify") {
  if (error?.status === 429) return "Too many attempts. Please wait a minute and try again.";
  const code = error?.code ?? "";
  if (step === "verify") {
    if (code.includes("EXPIRED")) return "That code has expired. Please request a new one.";
    if (code.includes("TOO_MANY")) return "Too many wrong attempts. Please request a new code.";
    if (code.includes("INVALID")) return "That code isn't right. Please check it and try again.";
    return "We couldn't verify the code. Please try again.";
  }
  return "We couldn't send the code. Please try again.";
}

export function LoginForm({ next }: { next: string | null }) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  async function sendCode(address: string) {
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email: address, type: "sign-in" });
    if (error) return friendly(error, "send");
    setCooldown(RESEND_SECONDS);
    return null;
  }

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    const parsed = emailSchema.safeParse(email.trim().toLowerCase());
    if (!parsed.success) return setFieldError(parsed.error.issues[0].message);
    setFieldError(null);
    setPending(true);
    const err = await sendCode(parsed.data);
    setPending(false);
    if (err) return setNotice({ tone: "error", text: err });
    setEmail(parsed.data);
    setStep("code");
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    const parsed = codeSchema.safeParse(code);
    if (!parsed.success) return setFieldError(parsed.error.issues[0].message);
    setFieldError(null);
    setPending(true);
    const { data, error } = await authClient.signIn.emailOtp({ email, otp: parsed.data });
    if (error || !data) {
      setPending(false);
      return setNotice({ tone: "error", text: friendly(error, "verify") });
    }
    // Middleware and server components see the new session cookie on this navigation.
    router.replace(next ?? homeForRole(toRole(data.user.role)));
    router.refresh();
  }

  async function onResend() {
    setNotice(null);
    setPending(true);
    const err = await sendCode(email);
    setPending(false);
    setNotice(err ? { tone: "error", text: err } : { tone: "info", text: "A new code is on its way." });
  }

  if (step === "email") {
    return (
      <form onSubmit={onEmail} noValidate className="mt-10 space-y-6">
        <Field label="Email" error={fieldError}>
          {(p) => (
            <Input
              {...p}
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
        </Field>
        {notice && <FormNotice tone={notice.tone}>{notice.text}</FormNotice>}
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Sending…" : "Send code"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={onVerify} noValidate className="mt-10 space-y-6">
      <FormNotice>
        If an account can use this address, a code has been sent to <strong className="font-semibold">{email}</strong>. It
        expires in 10 minutes.
      </FormNotice>
      <Field label="6-digit code" error={fieldError}>
        {(p) => (
          <Input
            {...p}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            placeholder="000000"
            className="font-mono text-2xl tracking-[0.5em]"
            value={code}
            // Paste-friendly: keep digits only, e.g. "123 456" -> "123456".
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            autoFocus
            required
          />
        )}
      </Field>
      {notice && <FormNotice tone={notice.tone}>{notice.text}</FormNotice>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Verifying…" : "Verify"}
        </Button>
        <button
          type="button"
          onClick={onResend}
          disabled={pending || cooldown > 0}
          className="min-h-11 text-sm text-cream/70 underline underline-offset-4 transition-colors hover:text-cream disabled:text-cream/35 disabled:no-underline"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          setStep("email");
          setCode("");
          setNotice(null);
          setFieldError(null);
        }}
        className="min-h-11 text-sm text-cream/55 transition-colors hover:text-cream"
      >
        Use a different email
      </button>
    </form>
  );
}
