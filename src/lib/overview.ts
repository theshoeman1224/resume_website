// Builds the lanes of the career overview chart from career content, for a
// given view (which rows are shown, which years are in focus). Pure, so tests
// can pass plain objects, and so the browser can rebuild the layout when the
// view changes.

import {
  careerKey,
  groupByEmployer,
  type AccomplishmentLike,
  type RoleLike,
  type WorkProjectLike,
} from "./career";
import { formatDateRange, formatSpan } from "./dates";
import { DEFAULT_VIEW, laneSlug, normalizeView, type TimelineView, type ViewContext } from "./timeline-view";
import { createScale, packLanes, yearMarkers, type Scale, type YearMarker } from "./timescale";

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
/** Year labels closer than this (percent of the track) are thinned out. */
const MIN_YEAR_LABEL_GAP = ((4 * LABEL_CHAR_PX + 8) / NOMINAL_TRACK_PX) * 100;

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
  /** Drawn without a label: a bar too short to hold one, or anything wholly inside a compressed band. */
  compact: boolean;
  /** Its lane is hidden, or (for wins and work projects) the lanes of the roles it belongs to are. */
  hidden: boolean;
}

export interface OverviewLane {
  /** Stable id, used in shared URLs; see src/lib/timeline-view.ts. */
  id: string;
  label: string;
  /** "bars" lanes hold labelled bars; the "wins" lane holds markers with labels beside them. */
  style: "bars" | "wins";
  rows: number;
  /** Turned off in the view, or nothing in it is visible. */
  hidden: boolean;
  items: OverviewItem[];
}

export interface Overview {
  lanes: OverviewLane[];
  years: YearMarker[];
  /** Compressed stretches of the track, in percent. */
  bands: { start: number; end: number }[];
  now: number;
  /** The view this layout was built for, normalized. */
  view: TimelineView;
  /** Lane ids and year span, for reading and writing views. */
  context: ViewContext;
}

type Titled = { shortTitle?: string; title: string };

export interface OverviewInputs {
  roles: readonly (RoleLike & { data: Titled })[];
  accomplishments: readonly (AccomplishmentLike & { data: Titled & { endDate?: Date } })[];
  workProjects: readonly (WorkProjectLike & { data: Titled })[];
  now?: Date;
}

/** An item before layout: dates rather than track positions. */
interface ItemSpec {
  key: string;
  kind: OverviewKind;
  label: string;
  description: string;
  start: Date;
  /** Undefined for an ongoing bar or a point win. */
  end?: Date;
  point: boolean;
  /** Roles whose lanes decide whether a win or work project is shown. */
  owners: readonly string[];
}

interface LaneSpec {
  id: string;
  label: string;
  style: OverviewLane["style"];
  items: ItemSpec[];
}

function labelWidthPercent(text: string): number {
  return ((MARKER_PX + text.length * LABEL_CHAR_PX) / NOMINAL_TRACK_PX) * 100;
}

function sameMonth(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

/** First 1 January on or before the earliest entry, and a few months past the latest. */
function chartRange({ roles, accomplishments, workProjects }: OverviewInputs, now: Date): [Date, Date] {
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
  return [rangeStart, new Date(Date.UTC(lastDay.getUTCFullYear(), lastDay.getUTCMonth() + TAIL_MONTHS, 1))];
}

/** The lanes and their items, newest employer first, then work projects, then wins. */
function laneSpecs({ roles, accomplishments, workProjects }: OverviewInputs, now: Date): LaneSpec[] {
  const current = roles.find((r) => !r.data.endDate && (r.data.track ?? "primary") === "primary");
  const taken = new Set<string>();
  const uniqueId = (base: string) => {
    let id = base;
    for (let n = 2; taken.has(id); n += 1) id = `${base}-${n}`;
    taken.add(id);
    return id;
  };

  function roleKind(role: RoleLike): OverviewKind {
    if (role === current) return "current";
    return (role.data.track ?? "primary") === "education" ? "education" : "role";
  }

  function bar(key: string, kind: OverviewKind, entry: { startDate: Date; endDate?: Date } & Titled, context: string, owners: readonly string[] = []): ItemSpec {
    return {
      key,
      kind,
      label: entry.shortTitle ?? entry.title,
      description: `${entry.title}, ${context}, ${formatDateRange(entry.startDate, entry.endDate)}`,
      start: entry.startDate,
      end: entry.endDate,
      point: false,
      owners,
    };
  }

  const lanes: LaneSpec[] = [];
  for (const group of groupByEmployer(roles, now)) {
    const slug = laneSlug(group.organization);
    lanes.push({
      id: uniqueId(slug),
      label: group.organization,
      style: "bars",
      items: group.roles.map(({ role }) => bar(careerKey.role(role.id), roleKind(role), role.data, role.data.organization)),
    });
    const concurrent = group.roles.flatMap((entry) => entry.concurrent);
    if (concurrent.length > 0) {
      lanes.push({
        id: uniqueId(`${slug}-concurrent`),
        label: "Concurrent",
        style: "bars",
        items: concurrent.map((role) =>
          bar(careerKey.role(role.id), "concurrent", role.data, `${role.data.organization}, held alongside another role`),
        ),
      });
    }
  }

  if (workProjects.length > 0) {
    lanes.push({
      id: uniqueId("projects"),
      label: "Work projects",
      style: "bars",
      items: [...workProjects]
        .sort((a, b) => a.data.startDate.valueOf() - b.data.startDate.valueOf())
        .map((p) => bar(careerKey.work(p.id), "project", p.data, `work project at ${p.data.organization}`, p.data.roles)),
    });
  }

  if (accomplishments.length > 0) {
    lanes.push({
      id: uniqueId("wins"),
      label: "Wins",
      style: "wins",
      items: [...accomplishments]
        .sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf())
        .map((a) => {
          const point = !a.data.endDate || sameMonth(a.data.date, a.data.endDate);
          return {
            key: careerKey.win(a.id),
            kind: "win" as const,
            label: a.data.shortTitle ?? a.data.title,
            description: `${a.data.title}, ${formatSpan(a.data.date, a.data.endDate)}`,
            start: a.data.date,
            end: point ? undefined : a.data.endDate,
            point,
            owners: [a.data.roleId],
          };
        }),
    });
  }
  return lanes;
}

/** Which items the view hides: everything in a hidden lane, and wins and projects whose roles' lanes are all hidden. */
function hiddenKeys(lanes: readonly LaneSpec[], shown: ReadonlySet<string> | null): Set<string> {
  const isShown = (laneId: string) => shown === null || shown.has(laneId);
  const roleLane = new Map<string, string>();
  for (const lane of lanes) {
    for (const item of lane.items) if (item.kind !== "project" && item.kind !== "win") roleLane.set(item.key, lane.id);
  }
  const ownerShown = (roleId: string) => {
    const laneId = roleLane.get(careerKey.role(roleId));
    return laneId === undefined || isShown(laneId);
  };
  const hidden = new Set<string>();
  for (const lane of lanes) {
    for (const item of lane.items) {
      const orphaned = item.owners.length > 0 && !item.owners.some(ownerShown);
      if (!isShown(lane.id) || orphaned) hidden.add(item.key);
    }
  }
  return hidden;
}

function layoutItem(spec: ItemSpec, style: OverviewLane["style"], scale: Scale, hidden: boolean): OverviewItem {
  const start = scale.at(spec.start);
  const bars = style === "bars";
  let end = start;
  if (spec.end) end = scale.at(spec.end);
  else if (bars) end = 100;
  return {
    key: spec.key,
    kind: spec.kind,
    label: spec.label,
    description: spec.description,
    start,
    end,
    row: 0,
    point: spec.point,
    ongoing: bars && !spec.end,
    flip: false,
    // Anything wholly inside a compressed band is drawn without a label, as is a bar too short for one.
    compact: bars
      ? end - start < labelWidthPercent("x".repeat(MIN_LABEL_CHARS)) || !scale.overlapsFocus(spec.start, spec.end ?? null)
      : !scale.overlapsFocus(spec.start, spec.end),
    hidden,
  };
}

/** Stacks a lane's visible items into rows so nothing overlaps. Hidden items take no space. */
function packLane(items: OverviewItem[], style: OverviewLane["style"]): number {
  const visible = items.filter((item) => !item.hidden);
  const extents = visible.map((item) => {
    if (style === "bars") return { start: item.start, end: item.end };
    const width = item.compact ? labelWidthPercent("") : labelWidthPercent(item.label);
    item.flip = !item.compact && item.start + width > 100;
    return item.flip
      ? { start: Math.min(item.start, item.end - width), end: item.end }
      : { start: item.start, end: Math.max(item.end, item.start + width) };
  });
  // Bars may touch (one role ends the day the next starts); win labels need breathing room.
  const rows = packLanes(extents, style === "wins" ? 0.5 : -1e-6);
  visible.forEach((item, index) => (item.row = rows[index]));
  return Math.max(1, ...rows.map((r) => r + 1));
}

export function buildOverview(inputs: OverviewInputs, view: TimelineView = DEFAULT_VIEW): Overview {
  const now = inputs.now ?? new Date();
  const [rangeStart, rangeEnd] = chartRange(inputs, now);
  const specs = laneSpecs(inputs, now);
  const context: ViewContext = {
    laneIds: specs.map((lane) => lane.id),
    firstYear: rangeStart.getUTCFullYear(),
    lastYear: now.getUTCFullYear(),
  };
  const normalized = normalizeView(view, context);
  const focusEnd = normalized.to === null ? rangeEnd : new Date(Date.UTC(normalized.to + 1, 0, 1));
  const scale = createScale({ rangeStart, rangeEnd, focus: { start: new Date(Date.UTC(normalized.from, 0, 1)), end: focusEnd } });
  const hidden = hiddenKeys(specs, normalized.show === null ? null : new Set(normalized.show));

  const lanes = specs.map((spec): OverviewLane => {
    const items = spec.items.map((item) => layoutItem(item, spec.style, scale, hidden.has(item.key)));
    const rows = packLane(items, spec.style);
    return { id: spec.id, label: spec.label, style: spec.style, rows, hidden: items.every((item) => item.hidden), items };
  });

  return {
    lanes,
    years: yearMarkers(rangeStart, rangeEnd, scale, MIN_YEAR_LABEL_GAP),
    bands: scale.bands,
    now: scale.at(now),
    view: normalized,
    context,
  };
}

/** Inline style for an item; shared by the server render and the browser re-layout. */
export function itemStyle(item: OverviewItem): string {
  return `--start: ${item.start}%; --end: ${item.end}%; --row: ${item.row}`;
}

/** Year labels inside a compressed band are abbreviated: 2016 → ’16. */
export function yearLabel(marker: YearMarker): string {
  return marker.compressed ? `’${String(marker.year).slice(-2)}` : String(marker.year);
}

/**
 * The fields buildOverview reads, as JSON, so the browser can rebuild the
 * chart without shipping whole content entries. `now` is the build's, so the
 * browser layout matches the server render exactly.
 */
export function serializeOverviewInputs({ roles, accomplishments, workProjects, now = new Date() }: OverviewInputs): string {
  const pick = <T extends object, K extends keyof T>(data: T, keys: readonly K[]) =>
    Object.fromEntries(keys.map((key) => [key, data[key]]));
  return JSON.stringify({
    now,
    roles: roles.map(({ id, data }) => ({
      id,
      data: { ...pick(data, ["title", "shortTitle", "organization", "startDate", "endDate", "order", "track"]), accomplishments: [] },
    })),
    accomplishments: accomplishments.map(({ id, data }) => ({
      id,
      data: { ...pick(data, ["title", "shortTitle", "date", "endDate", "roleId", "category"]), relatedRoles: [] },
    })),
    workProjects: workProjects.map(({ id, data }) => ({
      id,
      data: pick(data, ["title", "shortTitle", "organization", "startDate", "endDate", "roles"]),
    })),
  }).replaceAll("<", String.raw`<`);
}

const DATE_FIELDS = new Set(["now", "startDate", "endDate", "date"]);

export function parseOverviewInputs(json: string): OverviewInputs {
  return JSON.parse(json, (key, value) => (DATE_FIELDS.has(key) && typeof value === "string" ? new Date(value) : value));
}
