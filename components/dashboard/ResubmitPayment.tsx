"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { resubmitPayment } from "@/app/(participant)/dashboard/actions";
import { Button, Field, FormNotice, Input } from "@/components/ui";
import { checkScreenshot, SCREENSHOT_TYPES } from "@/lib/validation/payment";

export function ResubmitPayment({ fee }: { fee: number }) {
  const [utr, setUtr] = useState("");
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const problem = checkScreenshot(file);
    if (problem) return setErrors((x) => ({ ...x, screenshotUrl: problem }));
    setUploading(true);
    setErrors((x) => ({ ...x, screenshotUrl: "" }));
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload/payment-screenshot", { method: "POST", body });
      const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error || "The upload didn't go through. Please try again.");
      setUrl(json.url);
    } catch (err) {
      setErrors((x) => ({ ...x, screenshotUrl: err instanceof Error ? err.message : "The upload didn't go through." }));
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      className="mt-6 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setFormError(null);
        start(async () => {
          const res = await resubmitPayment({ utr, screenshotUrl: url });
          if (!res.ok) {
            setErrors(res.fieldErrors ?? {});
            setFormError(res.formError ?? null);
          }
        });
      }}
    >
      <p className="text-sm text-cream/70">Registration fee: ₹{fee} per team. Payment is verified manually by the organisers.</p>
      <Field label="New transaction ID / UTR" error={errors.utr}>
        {(p) => <Input {...p} value={utr} onChange={(e) => setUtr(e.target.value)} autoComplete="off" spellCheck={false} />}
      </Field>
      <Field label="New payment screenshot" helper="An image, 5 MB or smaller." error={errors.screenshotUrl || null}>
        {(p) => (
          <div>
            <label
              className={`flex min-h-12 cursor-pointer items-center justify-center border border-dashed border-cream/35 px-5 text-xs uppercase tracking-[0.24em] text-cream hover:border-cream ${
                uploading ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {uploading ? "Uploading…" : url ? "Replace screenshot" : "Choose screenshot"}
              <input {...p} type="file" accept={SCREENSHOT_TYPES.join(",")} onChange={onFile} className="sr-only" />
            </label>
            {url && (
              <Image src={url} alt="New payment screenshot" width={160} height={240} unoptimized className="mt-3 h-auto max-h-60 w-auto border border-divider" />
            )}
          </div>
        )}
      </Field>
      {formError && <FormNotice tone="error">{formError}</FormNotice>}
      <Button type="submit" disabled={pending || uploading}>
        {pending ? "Sending…" : "Resubmit payment"}
      </Button>
    </form>
  );
}
