"use client";

import Image from "next/image";
import { useRef } from "react";

/**
 * Thumbnail that opens the full screenshot in a native modal <dialog>:
 * Escape closes it and focus stays inside while open.
 */
export function ScreenshotDialog({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="block border border-divider transition-colors hover:border-cream/60"
        aria-label={`Enlarge ${label}`}
      >
        <Image src={src} alt={label} width={96} height={144} unoptimized className="h-28 w-20 object-cover" />
      </button>
      <dialog
        ref={ref}
        aria-label={label}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close(); // click on the backdrop
        }}
        className="m-auto max-h-[92dvh] max-w-[92vw] bg-transparent p-0 backdrop:bg-black/85"
      >
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            autoFocus
            onClick={() => ref.current?.close()}
            className="min-h-11 px-3 text-xs uppercase tracking-[0.2em] text-cream"
          >
            Close
          </button>
          <Image
            src={src}
            alt={label}
            width={900}
            height={1600}
            unoptimized
            className="h-auto max-h-[82dvh] w-auto max-w-[90vw] object-contain"
          />
        </div>
      </dialog>
    </>
  );
}
