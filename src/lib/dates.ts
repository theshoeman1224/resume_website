const monthYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatMonthYear(date: Date): string {
  return monthYear.format(date);
}

export function formatDateRange(start: Date, end?: Date): string {
  return `${formatMonthYear(start)} – ${end ? formatMonthYear(end) : "Present"}`;
}

/** Whole calendar months from `start` to `end` (Oct 2019 → Jan 2025 is 63). */
export function monthsBetween(start: Date, end: Date): number {
  return (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth());
}

/** "5 yrs 3 mos", "7 mos", "1 yr". An open end counts to `now`; anything under a month reads "1 mo". */
export function formatDuration(start: Date, end?: Date, now = new Date()): string {
  const months = Math.max(1, monthsBetween(start, end ?? now));
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years > 0) parts.push(`${years} yr${years === 1 ? "" : "s"}`);
  if (rest > 0) parts.push(`${rest} mo${rest === 1 ? "" : "s"}`);
  return parts.join(" ");
}

function sameMonth(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

/** Like formatDateRange, but collapses a range inside one month to a single month. */
export function formatSpan(start: Date, end?: Date): string {
  return end && sameMonth(start, end) ? formatMonthYear(start) : formatDateRange(start, end);
}

/**
 * Formats project metadata dates (ISO strings). An ongoing project with only a
 * start date reads "Aug 2026 – Present"; a finished one with only a start date
 * shows that single month.
 */
export function formatProjectDates(
  dates: { started?: string; completed?: string },
  ongoing: boolean,
): string | undefined {
  const started = dates.started ? new Date(dates.started) : undefined;
  const completed = dates.completed ? new Date(dates.completed) : undefined;
  if (!started) return completed && formatMonthYear(completed);
  if (completed || ongoing) return formatSpan(started, completed);
  return formatMonthYear(started);
}
