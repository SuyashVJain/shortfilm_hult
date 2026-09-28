import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: ReactNode;
  caption?: string;
};

/**
 * Dense admin table: charcoal rows, thin dividers, sticky header.
 * Scrolls horizontally inside its own container on narrow screens.
 * To make a whole row clickable, give one cell's link the `row-link` class.
 */
export function DataTable<T>({ columns, rows, rowKey, empty = "Nothing here yet.", caption }: Props<T>) {
  return (
    <div className="max-h-[70dvh] overflow-auto border border-divider">
      <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="sticky top-0 z-10 bg-charcoal-2">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={`border-b border-divider px-3 py-2.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-cream-muted ${c.className ?? ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-cream/60">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="relative border-b border-divider bg-charcoal transition-colors last:border-0 hover:bg-charcoal-2 [&_.row-link]:after:absolute [&_.row-link]:after:inset-0"
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-3 py-2.5 align-top text-cream/90 ${c.className ?? ""}`}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
