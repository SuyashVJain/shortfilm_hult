// Display formatting for settings values. Every value still comes from getSettings().

const TZ = "Asia/Kolkata";

/** "7 October 2026" */
export function deadlineLong(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: TZ }).format(new Date(iso));
}

/** "7 OCT" */
export function deadlineShort(iso: string) {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: TZ }).format(d);
  const month = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: TZ }).format(d);
  return `${day} ${month.toUpperCase()}`;
}

/** "2–7" */
export function teamSizeRange(min: number, max: number) {
  return `${min}–${max}`;
}

export function rupees(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}
