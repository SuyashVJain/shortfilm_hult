import Link from "next/link";
import { PaymentQueue } from "@/components/admin/PaymentQueue";
import { listPayments } from "@/lib/admin-data";
import { requireRole } from "@/lib/guards";
import { PAYMENT_LABEL, type PaymentStatusValue } from "@/lib/payment-status";

const TABS: PaymentStatusValue[] = ["PENDING", "VERIFIED", "REJECTED"];

export default async function AdminPaymentsPage({ searchParams }: PageProps<"/admin/payments">) {
  await requireRole("ADMIN");
  const { tab } = await searchParams;
  const status = TABS.find((t) => t === tab) ?? "PENDING";
  const items = await listPayments(status);

  return (
    <>
      <h1 className="font-display text-4xl uppercase text-cream">Payments</h1>
      <p className="mt-2 max-w-prose text-sm text-cream/60">
        Teams already have access while their payment is under review. Check the screenshot against the UTR.
      </p>

      <nav aria-label="Payment status" className="mt-6 flex gap-1 border-b border-divider">
        {TABS.map((t) => (
          <Link
            key={t}
            href={t === "PENDING" ? "/admin/payments" : `/admin/payments?tab=${t}`}
            aria-current={t === status ? "page" : undefined}
            className={`-mb-px flex min-h-11 items-center border-b-2 px-4 text-xs uppercase tracking-[0.18em] ${
              t === status ? "border-red text-cream" : "border-transparent text-cream/55 hover:text-cream"
            }`}
          >
            {PAYMENT_LABEL[t]}
          </Link>
        ))}
      </nav>

      <div className="mt-4">
        {/* key resets the local "reviewed" list when switching tabs */}
        <PaymentQueue key={status} items={items} reviewable={status === "PENDING"} />
      </div>
    </>
  );
}
