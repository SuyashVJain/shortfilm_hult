import Link from "next/link";
import { DataTable, StatusBadge, type Column } from "@/components/ui";
import { listTeams, type TeamRow } from "@/lib/admin-data";
import { requireRole } from "@/lib/guards";
import { PAYMENT_LABEL, PAYMENT_STATUSES, PAYMENT_TONE, SUBMISSION_LABEL } from "@/lib/payment-status";
import { getSettings } from "@/lib/settings";

const PAGE_SIZE = 25;
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");
const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });

const control = "min-h-11 rounded-sm border border-cream/25 bg-charcoal px-3 text-sm text-cream focus:border-red focus:outline-none";

export default async function AdminTeamsPage({ searchParams }: PageProps<"/admin/teams">) {
  await requireRole("ADMIN");
  const sp = await searchParams;
  const q = one(sp.q).trim().toLowerCase();
  const sdg = Number(one(sp.sdg)) || null;
  const payment = PAYMENT_STATUSES.find((s) => s === one(sp.payment)) ?? null;
  const sort = one(sp.sort) === "asc" ? "asc" : "desc";

  const [all, settings] = await Promise.all([listTeams(), getSettings()]);
  let rows = all.filter(
    (t) =>
      (!q || [t.code, t.name, t.leaderName].some((v) => v.toLowerCase().includes(q))) &&
      (!sdg || t.sdg === sdg) &&
      (!payment || t.latestPayment === payment),
  );
  if (sort === "asc") rows = rows.slice().reverse();

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(one(sp.page)) || 1), pages);
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const link = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sdg) params.set("sdg", String(sdg));
    if (payment) params.set("payment", payment);
    if (sort === "asc") params.set("sort", "asc");
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return `/admin/teams${s ? `?${s}` : ""}`;
  };

  const columns: Column<TeamRow>[] = [
    {
      key: "code",
      header: "Team ID",
      cell: (t) => (
        <Link href={`/admin/teams/${t.id}`} className="row-link font-mono text-cream hover:underline">
          {t.code}
        </Link>
      ),
    },
    { key: "name", header: "Team name", cell: (t) => t.name },
    { key: "leader", header: "Leader", cell: (t) => t.leaderName },
    { key: "sdg", header: "SDG", cell: (t) => t.sdg ?? <span className="text-cream/45">Not yet chosen</span> },
    { key: "size", header: "Size", cell: (t) => t.size },
    {
      key: "payment",
      header: "Payment",
      cell: (t) =>
        t.latestPayment ? <StatusBadge tone={PAYMENT_TONE[t.latestPayment]}>{PAYMENT_LABEL[t.latestPayment]}</StatusBadge> : "None",
    },
    {
      key: "film",
      header: "Film",
      cell: (t) => SUBMISSION_LABEL[(t.filmStatus ?? "NOT_SUBMITTED") as keyof typeof SUBMISSION_LABEL],
    },
    { key: "created", header: "Created", cell: (t) => <span className="whitespace-nowrap">{date.format(t.createdAt)}</span> },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl uppercase text-cream">Teams</h1>
        <Link
          href="/admin/teams/export"
          prefetch={false}
          className="inline-flex min-h-11 items-center border border-cream/40 px-4 text-xs uppercase tracking-[0.2em] text-cream hover:border-cream"
        >
          Export CSV
        </Link>
      </div>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3" role="search">
        <label className="flex min-w-60 flex-1 flex-col gap-1 text-[0.65rem] uppercase tracking-[0.18em] text-cream-muted">
          Search
          <input name="q" defaultValue={q} placeholder="Team ID, name or leader" className={control} />
        </label>
        <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-[0.18em] text-cream-muted">
          SDG
          <select name="sdg" defaultValue={sdg ?? ""} className={control}>
            <option value="">All</option>
            {settings.sdgThemes.map((t) => (
              <option key={t.number} value={t.number}>
                SDG {t.number}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-[0.18em] text-cream-muted">
          Payment
          <select name="payment" defaultValue={payment ?? ""} className={control}>
            <option value="">All</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {PAYMENT_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-[0.18em] text-cream-muted">
          Sort
          <select name="sort" defaultValue={sort} className={control}>
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </label>
        <button type="submit" className="min-h-11 bg-red px-5 text-xs uppercase tracking-[0.2em] text-cream">
          Apply
        </button>
        {(q || sdg || payment || sort === "asc") && (
          <Link href="/admin/teams" className="flex min-h-11 items-center px-2 text-xs text-cream/60 underline underline-offset-4">
            Clear
          </Link>
        )}
      </form>

      <p className="mt-6 mb-3 text-xs text-cream/55" aria-live="polite">
        {rows.length} {rows.length === 1 ? "team" : "teams"}
        {pages > 1 && ` · page ${page} of ${pages}`}
      </p>
      <DataTable caption="Teams" columns={columns} rows={pageRows} rowKey={(t) => t.id} empty="No teams match these filters." />

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-4 flex items-center gap-4 text-sm">
          {page > 1 ? (
            <Link href={link(page - 1)} className="min-h-11 px-2 py-3 text-cream underline underline-offset-4">
              ← Previous
            </Link>
          ) : null}
          {page < pages ? (
            <Link href={link(page + 1)} className="min-h-11 px-2 py-3 text-cream underline underline-offset-4">
              Next →
            </Link>
          ) : null}
        </nav>
      )}
    </>
  );
}
