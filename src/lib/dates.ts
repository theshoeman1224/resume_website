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
