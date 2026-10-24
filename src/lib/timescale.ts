// Layout math for the career overview chart. Positions are percentages of the
// chart track's width.

/** Empty space kept at each end of the track so edge bars and labels are not clipped. */
export const TRACK_PADDING_PERCENT = 2;

/** Share of the padded track the focused years get; the years outside share the rest. */
export const FOCUS_SHARE = 0.9;

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

export interface Scale {
  /** Track position (percent) of a date. */
  at(date: Date): number;
  /** False for dates in a compressed band. Always true on a linear scale. */
  inFocus(date: Date): boolean;
  /**
   * Whether a span reaches into the focus; one that only touches its edge
   * doesn't. No `end` means a single moment; `null` means ongoing.
   */
  overlapsFocus(start: Date, end?: Date | null): boolean;
  /** The compressed stretches of the track, in percent. Empty on a linear scale. */
  bands: { start: number; end: number }[];
}

export interface ScaleOptions {
  rangeStart: Date;
  rangeEnd: Date;
  /** The years to emphasise. Omitted, or covering the whole range, gives a linear scale. */
  focus?: { start: Date; end: Date };
  focusShare?: number;
  padding?: number;
}

/**
 * A piecewise-linear time scale. The focus gets `focusShare` of the padded
 * track and the stretches before and after it split the rest by duration, so
 * recent years read large while the whole range stays on the chart. The focus
 * never gets less than its linear share: compression only ever shrinks the
 * years outside it.
 */
export function createScale({
  rangeStart,
  rangeEnd,
  focus,
  focusShare = FOCUS_SHARE,
  padding = TRACK_PADDING_PERCENT,
}: ScaleOptions): Scale {
  const t0 = rangeStart.valueOf();
  const t1 = rangeEnd.valueOf();
  const f0 = Math.min(Math.max(focus?.start.valueOf() ?? t0, t0), t1);
  const f1 = Math.min(Math.max(focus?.end.valueOf() ?? t1, f0), t1);
  const before = f0 - t0;
  const after = t1 - f1;
  const outside = before + after;
  const linear = {
    at: (date: Date) => timePosition(date, rangeStart, rangeEnd, padding),
    inFocus: () => true,
    overlapsFocus: () => true,
    bands: [],
  };
  if (outside <= 0 || f1 <= f0) return linear;

  const width = 100 - padding * 2;
  const share = Math.max(focusShare, (f1 - f0) / (t1 - t0));
  const p0 = padding + (width * (1 - share) * before) / outside;
  const p1 = p0 + width * share;
  // Knots in time order; zero-length stretches are dropped so no segment divides by zero.
  const knots = [
    [t0, padding],
    [f0, p0],
    [f1, p1],
    [t1, 100 - padding],
  ].filter(([t], index, all) => index === 0 || t > all[index - 1][0]);

  function at(date: Date): number {
    const t = date.valueOf();
    // Dates past either end extend the outermost segment, like timePosition does.
    let segment = knots.findIndex(([end], index) => index > 0 && t <= end);
    if (segment === -1) segment = knots.length - 1;
    const [ta, pa] = knots[segment - 1];
    const [tb, pb] = knots[segment];
    return pa + ((t - ta) / (tb - ta)) * (pb - pa);
  }

  const bands = [
    ...(before > 0 ? [{ start: padding, end: p0 }] : []),
    ...(after > 0 ? [{ start: p1, end: 100 - padding }] : []),
  ];
  const inFocus = (date: Date) => date.valueOf() >= f0 && date.valueOf() <= f1;
  function overlapsFocus(start: Date, end?: Date | null): boolean {
    if (end === undefined) return inFocus(start);
    return start.valueOf() < f1 && (end === null ? Infinity : end.valueOf()) > f0;
  }
  return { at, inFocus, overlapsFocus, bands };
}

export interface YearMarker {
  year: number;
  position: number;
  /** The year starts in a compressed band. */
  compressed: boolean;
  /** False when the tick sits too close to the previous labelled one; its gridline stays. */
  labelled: boolean;
}

/**
 * One tick per 1 January inside the range. A tick closer than `minLabelGap`
 * (percent) to a labelled one loses its label. Focused years are labelled
 * first, so crowding only ever drops compressed years.
 */
export function yearMarkers(
  rangeStart: Date,
  rangeEnd: Date,
  scale: Scale = createScale({ rangeStart, rangeEnd }),
  minLabelGap = 0,
): YearMarker[] {
  const markers: YearMarker[] = [];
  for (let year = rangeStart.getUTCFullYear(); year <= rangeEnd.getUTCFullYear(); year += 1) {
    const yearStart = new Date(Date.UTC(year, 0, 1));
    if (yearStart < rangeStart || yearStart > rangeEnd) continue;
    markers.push({ year, position: scale.at(yearStart), compressed: !scale.inFocus(yearStart), labelled: false });
  }
  const labelled: number[] = [];
  for (const marker of [...markers.filter((m) => !m.compressed), ...markers.filter((m) => m.compressed)]) {
    marker.labelled = labelled.every((position) => Math.abs(marker.position - position) >= minLabelGap);
    if (marker.labelled) labelled.push(marker.position);
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
