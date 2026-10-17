"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { EmailOtpForm } from "@/components/auth/EmailOtpForm";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button, Field, FormNotice, Input } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { homeForRole, toRole } from "@/lib/roles";
import { emailSchema, newPasswordSchema, otpSchema, PASSWORD_MIN } from "@/lib/validation/password";

type Mode = "password" | "code" | "forgot";

// One message for unknown email, wrong password, or an account with no password yet.
const BAD_LOGIN = "That email and password don't match. Try again, or sign in with an email code.";

const linkBtn = "min-h-11 text-sm text-cream/70 underline underline-offset-4 transition-colors hover:text-cream";

export function LoginForm({ next }: { next: string | null }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const goHome = (role?: string | null) => {
    // Middleware and server components see the new session cookie on this navigation.
    router.replace(next ?? homeForRole(toRole(role)));
    router.refresh();
  };

  return (
    <div className="mt-10">
      {mode === "password" && <PasswordSignIn onSignedIn={goHome} />}
      {mode === "code" && <EmailOtpForm onVerified={(user) => goHome(user.role)} />}
      {mode === "forgot" && <ForgotPassword onSignedIn={goHome} />}

      <div className="mt-8 flex flex-col items-start gap-1 border-t border-divider pt-6">
        {mode !== "password" && (
          <button type="button" className={linkBtn} onClick={() => setMode("password")}>
            Sign in with your password
          </button>
        )}
        {mode !== "forgot" && (
          <button type="button" className={linkBtn} onClick={() => setMode("forgot")}>
            Forgot password?
          </button>
        )}
        {mode !== "code" && (
          <button type="button" className={linkBtn} onClick={() => setMode("code")}>
            Sign in with an email code instead
          </button>
        )}
      </div>
    </div>
  );
}

function PasswordSignIn({ onSignedIn }: { onSignedIn: (role?: string | null) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const em = emailSchema.safeParse(email.trim().toLowerCase());
        const found: typeof errors = {};
        if (!em.success) found.email = em.error.issues[0].message;
        if (!password) found.password = "Please enter your password.";
        setErrors(found);
        if (Object.keys(found).length || !em.success) return;
        start(async () => {
          const { data, error: err } = await authClient.signIn.email({ email: em.data, password });
          if (err || !data) {
            setError(err?.status === 429 ? "Too many attempts. Please wait a minute and try again." : BAD_LOGIN);
            return;
          }
          onSignedIn(data.user.role);
        });
      }}
    >
      <Field label="Email" error={errors.email}>
        {(p) => (
          <Input {...p} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} />
        )}
      </Field>
      <Field label="Password" error={errors.password}>
        {(p) => <PasswordInput {...p} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />}
      </Field>
      {error && <FormNotice tone="error">{error}</FormNotice>}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

/** Email -> reset code -> new password; then signs in with it. */
function ForgotPassword({ onSignedIn }: { onSignedIn: (role?: string | null) => void }) {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const [pending, start] = useTransition();

  if (step === "email") {
    return (
      <form
        noValidate
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          setNotice(null);
          const em = emailSchema.safeParse(email.trim().toLowerCase());
          if (!em.success) return setErrors({ email: em.error.issues[0].message });
          setErrors({});
          start(async () => {
            const { error } = await authClient.emailOtp.requestPasswordReset({ email: em.data });
            if (error?.status === 429) return setNotice({ tone: "error", text: "Too many attempts. Please wait a minute and try again." });
            if (error && error.status && error.status >= 500) return setNotice({ tone: "error", text: "We couldn't send the code. Please try again." });
            setEmail(em.data);
            setStep("reset");
          });
        }}
      >
        <p className="text-cream/70">Enter your email and we&rsquo;ll send a code to reset your password.</p>
        <Field label="Email" error={errors.email}>
          {(p) => (
            <Input {...p} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} />
          )}
        </Field>
        {notice && <FormNotice tone={notice.tone}>{notice.text}</FormNotice>}
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send reset code"}
        </Button>
      </form>
    );
  }

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        setNotice(null);
        const found: Record<string, string> = {};
        const code = otpSchema.safeParse(otp);
        if (!code.success) found.otp = code.error.issues[0].message;
        const pw = newPasswordSchema.safeParse({ password, confirm });
        if (!pw.success) for (const i of pw.error.issues) found[String(i.path[0])] ??= i.message;
        setErrors(found);
        if (Object.keys(found).length) return;
        start(async () => {
          const { error } = await authClient.emailOtp.resetPassword({ email, otp, password });
          if (error) {
            const c = error.code ?? "";
            setNotice({
              tone: "error",
              text:
                error.status === 429
                  ? "Too many attempts. Please wait a minute and try again."
                  : c.includes("EXPIRED")
                    ? "That code has expired. Please request a new one."
                    : "That code isn't right. Please check it and try again.",
            });
            return;
          }
          const { data } = await authClient.signIn.email({ email, password });
          if (data) onSignedIn(data.user.role);
          else setNotice({ tone: "info", text: "Your password has been reset. Please sign in." });
        });
      }}
    >
      <FormNotice>
        If an account uses <strong className="font-semibold">{email}</strong>, a reset code is on its way. It expires in 10 minutes.
      </FormNotice>
      <Field label="6-digit code" error={errors.otp}>
        {(p) => (
          <Input
            {...p}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="font-mono text-2xl tracking-[0.5em]"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
        )}
      </Field>
      <Field label="New password" helper={`At least ${PASSWORD_MIN} characters.`} error={errors.password}>
        {(p) => <PasswordInput {...p} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />}
      </Field>
      <Field label="Confirm new password" error={errors.confirm}>
        {(p) => <PasswordInput {...p} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />}
      </Field>
      {notice && <FormNotice tone={notice.tone}>{notice.text}</FormNotice>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Reset password"}
      </Button>
    </form>
  );
}
