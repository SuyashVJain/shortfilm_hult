"use client";

import { useState, useTransition } from "react";
import { Button, Field, FormNotice, Input } from "@/components/ui";
import { juryLogin } from "../actions";

export function JuryLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      noValidate
      className="mt-10 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          // On success the action redirects to /jury; it only returns on failure.
          const res = await juryLogin({ username, password });
          if (res && !res.ok) setError(res.error);
        });
      }}
    >
      <Field label="Jury ID">
        {(p) => (
          <Input {...p} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} />
        )}
      </Field>
      <Field label="Password">
        {(p) => <Input {...p} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />}
      </Field>
      {error && <FormNotice tone="error">{error}</FormNotice>}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
