import Image from "next/image";
import { useState } from "react";
import { Field, FormNotice, Input } from "@/components/ui";
import { checkScreenshot, SCREENSHOT_TYPES } from "@/lib/validation/payment";
import type { StepProps } from "./types";

export function StepPayment({ draft, setDraft, errors, settings }: StepProps) {
  const { registrationFee, paymentInstructions } = settings;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow choosing the same file again after a failure
    if (!file) return;
    const problem = checkScreenshot(file);
    if (problem) return setUploadError(problem);
    setUploadError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload/payment-screenshot", { method: "POST", body });
      const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error || "The upload didn't go through. Please try again.");
      const url = json.url;
      setDraft((x) => ({ ...x, payment: { ...x.payment, screenshotUrl: url } }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "The upload didn't go through. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const screenshotError = uploadError ?? errors["payment.screenshotUrl"];

  return (
    <div className="space-y-8">
      <div className="border-l-2 border-red bg-charcoal/70 px-5 py-4">
        <p className="text-[0.7rem] uppercase tracking-[0.24em] text-cream-muted">Registration fee</p>
        <p className="mt-1 font-display text-3xl text-cream">₹{registrationFee} per team</p>
      </div>

      <div className="space-y-4">
        {paymentInstructions.text ? (
          <p className="whitespace-pre-line text-cream/80">{paymentInstructions.text}</p>
        ) : (
          <p className="text-cream/80">Payment details will be shared.</p>
        )}
        {paymentInstructions.qrImageUrl && (
          <Image
            src={paymentInstructions.qrImageUrl}
            alt="Payment QR code"
            width={240}
            height={240}
            unoptimized
            className="h-auto w-60 bg-cream p-2"
          />
        )}
        <p className="text-sm text-cream/60">Payment is verified manually by the organisers.</p>
      </div>

      <Field label="Transaction ID / UTR" error={errors["payment.utr"]}>
        {(p) => (
          <Input
            {...p}
            value={draft.payment.utr}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            onChange={(e) => {
              const value = e.target.value;
              setDraft((x) => ({ ...x, payment: { ...x.payment, utr: value } }));
            }}
          />
        )}
      </Field>

      <Field label="Payment screenshot" helper="An image (JPG, PNG, WebP or HEIC), 5 MB or smaller." error={screenshotError}>
        {(p) => (
          <div>
            <label
              className={`flex min-h-12 cursor-pointer items-center justify-center border border-dashed border-cream/35 px-5 text-xs uppercase tracking-[0.24em] text-cream transition-colors hover:border-cream ${
                uploading ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {uploading ? "Uploading…" : draft.payment.screenshotUrl ? "Replace screenshot" : "Choose screenshot"}
              <input
                {...p}
                type="file"
                accept={SCREENSHOT_TYPES.join(",")}
                onChange={onFile}
                disabled={uploading}
                className="sr-only"
              />
            </label>
            {draft.payment.screenshotUrl && (
              <Image
                src={draft.payment.screenshotUrl}
                alt="Your uploaded payment screenshot"
                width={320}
                height={480}
                unoptimized
                className="mt-4 h-auto max-h-80 w-auto max-w-full border border-divider object-contain"
              />
            )}
          </div>
        )}
      </Field>
      {screenshotError && uploadError && (
        <FormNotice>Your other details are saved. Choose the image again to retry.</FormNotice>
      )}
    </div>
  );
}
