// Layout math for the horizontal career timeline. Positions are percentages of
// the spine's width.

/** Empty space kept at each end of the spine so edge labels are not clipped. */
export const SPINE_PADDING_PERCENT = 10;

export function spinePosition(
  date: Date,
  rangeStart: Date,
  rangeEnd: Date,
  padding = SPINE_PADDING_PERCENT,
): number {
  const span = rangeEnd.valueOf() - rangeStart.valueOf();
  const ratio = span === 0 ? 0.5 : (date.valueOf() - rangeStart.valueOf()) / span;
  return padding + ratio * (100 - padding * 2);
}

/**
 * Pushes markers apart so no two sit closer than `minGap`, keeping each group
 * of crowded markers centred on where it was. Returns positions in input order.
 */
export function spreadPositions(positions: readonly number[], minGap: number): number[] {
  const result = [...positions];
  const order = result.map((_, index) => index).sort((a, b) => positions[a] - positions[b] || a - b);

  // Re-cluster until stable: spreading one group can crowd its neighbour.
  // Markers exactly minGap apart count as one group, so a run that has grown
  // into its neighbour is respaced as a whole instead of see-sawing.
  for (let pass = 0; pass <= positions.length; pass += 1) {
    let changed = false;
    let start = 0;
    while (start < order.length) {
      let end = start;
      while (end + 1 < order.length && result[order[end + 1]] - result[order[end]] < minGap + 1e-9) {
        end += 1;
      }
      if (end > start) {
        const members = order.slice(start, end + 1);
        const centre = members.reduce((sum, index) => sum + result[index], 0) / members.length;
        members.forEach((index, offset) => {
          const next = centre + (offset - (members.length - 1) / 2) * minGap;
          if (Math.abs(next - result[index]) > 1e-9) changed = true;
          result[index] = next;
        });
      }
      start = end + 1;
    }
    if (!changed) break;
  }
  return result;
}

export interface YearMarker {
  year: number;
  position: number;
  /** False when a role marker below the axis sits on this year; that role's label already shows the date. */
  labelled: boolean;
}

export function yearMarkers(
  rangeStart: Date,
  rangeEnd: Date,
  occupied: readonly number[] = [],
  clearance = 3,
  padding = SPINE_PADDING_PERCENT,
): YearMarker[] {
  const markers: YearMarker[] = [];
  for (let year = rangeStart.getUTCFullYear(); year <= rangeEnd.getUTCFullYear(); year += 1) {
    const yearStart = new Date(Date.UTC(year, 0, 1));
    if (yearStart < rangeStart || yearStart > rangeEnd) continue;
    const position = spinePosition(yearStart, rangeStart, rangeEnd, padding);
    const labelled = occupied.every((x) => Math.abs(x - position) >= clearance);
    markers.push({ year, position, labelled });
  }
  return markers;
}
