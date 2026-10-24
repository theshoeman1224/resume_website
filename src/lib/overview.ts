// Builds the lanes of the career overview chart from career content. Pure, so
// tests can pass plain objects.

import {
  careerKey,
  groupByEmployer,
  type AccomplishmentLike,
  type RoleLike,
  type WorkProjectLike,
} from "./career";
import { formatDateRange, formatSpan } from "./dates";
import { packLanes, timePosition, yearMarkers } from "./timescale";

/**
 * Label widths are estimated as a share of a nominal track width, so that
 * labels hanging off win markers can be packed into rows without colliding.
 * Close enough at desktop widths; the chart is hidden on narrow screens.
 */
const NOMINAL_TRACK_PX = 1000;
const LABEL_CHAR_PX = 7.6;
const MARKER_PX = 18;
/** Space after an ongoing bar's last day, so "now" isn't the chart's edge. */
const TAIL_MONTHS = 3;
/** A bar too narrow for this many characters drops its label; the lane label and tooltip still name it. */
const MIN_LABEL_CHARS = 3;

export type OverviewKind = "role" | "current" | "concurrent" | "education" | "project" | "win";

export interface OverviewItem {
  key: string;
  kind: OverviewKind;
  label: string;
  /** Full description for screen readers and the tooltip. */
  description: string;
  start: number;
  end: number;
  row: number;
  /** A win with no span is drawn as a dot. */
  point: boolean;
  ongoing: boolean;
  /** A win label that would run off the right edge sits to the left of its marker instead. */
  flip: boolean;
  /** A bar too short to hold a readable label, so it is drawn without one. */
  compact: boolean;
}

export interface OverviewLane {
  label: string;
  /** "bars" lanes hold labelled bars; the "wins" lane holds markers with labels beside them. */
  style: "bars" | "wins";
  rows: number;
  items: OverviewItem[];
}

export interface Overview {
  lanes: OverviewLane[];
  years: { year: number; position: number }[];
  now: number;
}

type Titled = { shortTitle?: string; title: string };

export interface OverviewInputs {
  roles: readonly (RoleLike & { data: Titled })[];
  accomplishments: readonly (AccomplishmentLike & { data: Titled & { endDate?: Date } })[];
  workProjects: readonly (WorkProjectLike & { data: Titled })[];
  now?: Date;
}

function labelWidthPercent(text: string): number {
  return ((MARKER_PX + text.length * LABEL_CHAR_PX) / NOMINAL_TRACK_PX) * 100;
}

function sameMonth(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

export function buildOverview({ roles, accomplishments, workProjects, now = new Date() }: OverviewInputs): Overview {
  const starts = [
    ...roles.map((r) => r.data.startDate),
    ...workProjects.map((p) => p.data.startDate),
    ...accomplishments.map((a) => a.data.date),
  ].map((d) => d.valueOf());
  const ends = [
    now,
    ...roles.map((r) => r.data.endDate ?? now),
    ...workProjects.map((p) => p.data.endDate ?? now),
  ].map((d) => d.valueOf());
  const rangeStart = new Date(Date.UTC(new Date(Math.min(...starts)).getUTCFullYear(), 0, 1));
  const lastDay = new Date(Math.max(...ends));
  const rangeEnd = new Date(Date.UTC(lastDay.getUTCFullYear(), lastDay.getUTCMonth() + TAIL_MONTHS, 1));
  const at = (date: Date) => timePosition(date, rangeStart, rangeEnd);
  const current = roles.find((r) => !r.data.endDate && (r.data.track ?? "primary") === "primary");

  function roleKind(role: RoleLike): OverviewKind {
    if (role === current) return "current";
    return (role.data.track ?? "primary") === "education" ? "education" : "role";
  }

  /** A bar for a dated entry. Ongoing bars run to the chart's end and fade out. */
  function bar(
    key: string,
    kind: OverviewKind,
    entry: { startDate: Date; endDate?: Date } & Titled,
    context: string,
  ): OverviewItem {
    const start = at(entry.startDate);
    const end = entry.endDate ? at(entry.endDate) : 100;
    return {
      key,
      kind,
      label: entry.shortTitle ?? entry.title,
      description: `${entry.title}, ${context}, ${formatDateRange(entry.startDate, entry.endDate)}`,
      start,
      end,
      row: 0,
      point: false,
      ongoing: !entry.endDate,
      flip: false,
      compact: end - start < labelWidthPercent("x".repeat(MIN_LABEL_CHARS)),
    };
  }

  function lane(label: string, style: OverviewLane["style"], items: OverviewItem[]): OverviewLane {
    const extents = items.map((item) => {
      if (style === "bars") return { start: item.start, end: item.end };
      const width = labelWidthPercent(item.label);
      item.flip = item.start + width > 100;
      return item.flip
        ? { start: Math.min(item.start, item.end - width), end: item.end }
        : { start: item.start, end: Math.max(item.end, item.start + width) };
    });
    // Bars may touch (one role ends the day the next starts); win labels need breathing room.
    const rows = packLanes(extents, style === "wins" ? 0.5 : -1e-6);
    items.forEach((item, index) => (item.row = rows[index]));
    return { label, style, rows: Math.max(1, ...rows.map((r) => r + 1)), items };
  }

  const lanes: OverviewLane[] = [];
  for (const group of groupByEmployer(roles, now)) {
    lanes.push(
      lane(
        group.organization,
        "bars",
        group.roles.map(({ role }) => {
          return bar(careerKey.role(role.id), roleKind(role), role.data, role.data.organization);
        }),
      ),
    );
    const concurrent = group.roles.flatMap((entry) => entry.concurrent);
    if (concurrent.length > 0) {
      lanes.push(
        lane(
          "Concurrent",
          "bars",
          concurrent.map((role) => bar(careerKey.role(role.id), "concurrent", role.data, `${role.data.organization}, held alongside another role`)),
        ),
      );
    }
  }

  if (workProjects.length > 0) {
    lanes.push(
      lane(
        "Work projects",
        "bars",
        [...workProjects]
          .sort((a, b) => a.data.startDate.valueOf() - b.data.startDate.valueOf())
          .map((p) => bar(careerKey.work(p.id), "project", p.data, `work project at ${p.data.organization}`)),
      ),
    );
  }

  if (accomplishments.length > 0) {
    lanes.push(
      lane(
        "Wins",
        "wins",
        [...accomplishments]
          .sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf())
          .map((a) => {
            const point = !a.data.endDate || sameMonth(a.data.date, a.data.endDate);
            return {
              key: careerKey.win(a.id),
              kind: "win" as const,
              label: a.data.shortTitle ?? a.data.title,
              description: `${a.data.title}, ${formatSpan(a.data.date, a.data.endDate)}`,
              start: at(a.data.date),
              end: point ? at(a.data.date) : at(a.data.endDate!),
              row: 0,
              point,
              ongoing: false,
              flip: false,
              compact: false,
            };
          }),
      ),
    );
  }

  return { lanes, years: yearMarkers(rangeStart, rangeEnd), now: at(now) };
}
