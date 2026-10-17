"use client";

import { useState, type ComponentProps } from "react";
import { Input } from "@/components/ui";

/** Password field with a show/hide toggle. */
export function PasswordInput(props: Omit<ComponentProps<"input">, "type">) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className={`pr-20 ${props.className ?? ""}`} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-pressed={show}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-2 min-h-10 -translate-y-1/2 px-2 text-[0.65rem] uppercase tracking-[0.18em] text-cream/60 hover:text-cream"
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
