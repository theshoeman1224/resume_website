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
