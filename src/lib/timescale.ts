// Layout math for the career overview chart. Positions are percentages of the
// chart track's width.

/** Empty space kept at each end of the track so edge bars and labels are not clipped. */
export const TRACK_PADDING_PERCENT = 2;

export function timePosition(
  date: Date,
  rangeStart: Date,
  rangeEnd: Date,
  padding = TRACK_PADDING_PERCENT,
): number {
  const span = rangeEnd.valueOf() - rangeStart.valueOf();
  const ratio = span === 0 ? 0.5 : (date.valueOf() - rangeStart.valueOf()) / span;
  return padding + ratio * (100 - padding * 2);
}

/** One tick per 1 January inside the range. */
export function yearMarkers(
  rangeStart: Date,
  rangeEnd: Date,
  padding = TRACK_PADDING_PERCENT,
): { year: number; position: number }[] {
  const markers: { year: number; position: number }[] = [];
  for (let year = rangeStart.getUTCFullYear(); year <= rangeEnd.getUTCFullYear(); year += 1) {
    const yearStart = new Date(Date.UTC(year, 0, 1));
    if (yearStart < rangeStart || yearStart > rangeEnd) continue;
    markers.push({ year, position: timePosition(yearStart, rangeStart, rangeEnd, padding) });
  }
  return markers;
}

/**
 * Assigns each interval to the first row where it doesn't overlap anything
 * already placed, so overlapping bars stack instead of covering each other.
 * Intervals are placed in start order; the result is in input order.
 * `gap` is the space (in the same units) required between neighbours.
 */
export function packLanes(intervals: readonly { start: number; end: number }[], gap = 0): number[] {
  const rows: number[] = [];
  const lanes: number[] = new Array(intervals.length);
  const order = intervals.map((_, index) => index).sort((a, b) => intervals[a].start - intervals[b].start || a - b);
  for (const index of order) {
    const { start, end } = intervals[index];
    let row = rows.findIndex((rowEnd) => rowEnd + gap <= start);
    if (row === -1) {
      row = rows.length;
      rows.push(end);
    } else {
      rows[row] = end;
    }
    lanes[index] = row;
  }
  return lanes;
}
