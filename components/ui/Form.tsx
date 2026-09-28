import { useId, type ComponentProps, type ReactNode } from "react";

/*
 * Form primitives: label above, helper below, inline error.
 * Large touch targets (min 48px), thin cream borders, red focus ring.
 */

const control =
  "block w-full min-h-12 rounded-sm border border-cream/25 bg-charcoal px-4 py-3 text-base text-cream placeholder:text-cream/35 " +
  "transition-colors duration-300 hover:border-cream/45 " +
  "focus:border-red focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-red/60 " +
  "aria-[invalid=true]:border-red disabled:opacity-50";

type FieldChildProps = { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean };

type FieldProps = {
  label: string;
  helper?: ReactNode;
  error?: string | null;
  className?: string;
  /** Render prop receives the ids to wire onto the control. */
  children: (props: FieldChildProps) => ReactNode;
};

export function Field({ label, helper, error, className = "", children }: FieldProps) {
  const id = useId();
  const helperId = helper ? `${id}-help` : undefined;
  const errorId = error ? `${id}-err` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.24em] text-cream-muted">
        {label}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {helper && (
        <p id={helperId} className="mt-2 text-sm text-cream/55">
          {helper}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className = "", ...rest }: ComponentProps<"input">) {
  return <input className={`${control} ${className}`} {...rest} />;
}

export function Textarea({ className = "", ...rest }: ComponentProps<"textarea">) {
  return <textarea className={`${control} min-h-32 resize-y leading-relaxed ${className}`} {...rest} />;
}

export function Select({ className = "", children, ...rest }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={`${control} appearance-none pr-10 ${className}`} {...rest}>
        {children}
      </select>
      <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-cream/60">
        ▾
      </span>
    </div>
  );
}

type NoticeProps = { tone?: "error" | "info"; children: ReactNode; className?: string };

/** Minimal inline notice: cream on charcoal, red edge for errors. */
export function FormNotice({ tone = "info", children, className = "" }: NoticeProps) {
  const edge = tone === "error" ? "border-red" : "border-cream/40";
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`border-l-2 ${edge} bg-charcoal/90 px-4 py-3 text-sm leading-relaxed text-cream ${className}`}
    >
      {tone === "error" && <span className="sr-only">Error: </span>}
      {children}
    </div>
  );
}
