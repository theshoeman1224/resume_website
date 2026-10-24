// What the career overview chart shows (which rows, which years in focus) and
// how that is written to and read from the page URL, so a layout can be
// shared as a link. Pure, so tests and the browser use the same rules.
//
//   /experience/?from=2022&to=2024&show=raytheon,wins
//
// from/to: the focused years (to omitted means "through now").
// show:    the rows shown, by lane id; "all" or "none" also work.
// A value equal to the default is left out, so the plain URL is the default.

export interface TimelineView {
  /** First focused year. */
  from: number;
  /** Last focused year, or null for "through now". */
  to: number | null;
  /** Lane ids shown, in lane order, or null for every lane. */
  show: readonly string[] | null;
}

export interface ViewContext {
  /** Every lane id, in chart order. */
  laneIds: readonly string[];
  /** First and last years on the chart. */
  firstYear: number;
  lastYear: number;
}

/** Recent work up front: the Raytheon years, with school and co-ops hidden. */
export const DEFAULT_VIEW: TimelineView = {
  from: 2019,
  to: null,
  show: ["raytheon", "raytheon-concurrent", "projects", "wins"],
};

/** Lane id for an organization name: "J&M Brown" → "j-m-brown". */
export function laneSlug(text: string): string {
  return text
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-)|(-$)/g, "");
}

export function fullCareerView(ctx: ViewContext): TimelineView {
  return { from: ctx.firstYear, to: null, show: null };
}

const clampYear = (year: number, ctx: ViewContext) => Math.min(Math.max(year, ctx.firstYear), ctx.lastYear);

/**
 * Clamps years to the chart, puts them in order, drops unknown lane ids and
 * sorts the rest into lane order. A list naming every lane becomes null.
 */
export function normalizeView(view: TimelineView, ctx: ViewContext): TimelineView {
  let from = clampYear(view.from, ctx);
  let to = view.to === null ? null : clampYear(view.to, ctx);
  if (to !== null && to < from) [from, to] = [to, from];
  if (to === ctx.lastYear) to = null;
  const shown = view.show === null ? null : new Set(view.show);
  const show = shown === null ? null : ctx.laneIds.filter((id) => shown.has(id));
  return { from, to, show: show?.length === ctx.laneIds.length ? null : show };
}

function parseYear(value: string | null): number | undefined {
  return value !== null && /^\d{4}$/.test(value) ? Number(value) : undefined;
}

function parseShow(value: string | null, ctx: ViewContext): readonly string[] | null | undefined {
  if (value === null) return undefined;
  if (value === "all") return null;
  if (value === "none") return [];
  const known = new Set(ctx.laneIds);
  const ids = value.split(",").filter((id) => known.has(id));
  return ids.length > 0 ? ids : undefined;
}

/** Reads a view from URL search params. Each missing or unusable param falls back to the default. */
export function parseView(params: URLSearchParams, ctx: ViewContext): TimelineView {
  const toParam = params.get("to");
  const to = toParam === "now" ? null : parseYear(toParam);
  const show = parseShow(params.get("show"), ctx);
  return normalizeView(
    {
      from: parseYear(params.get("from")) ?? DEFAULT_VIEW.from,
      to: to === undefined ? DEFAULT_VIEW.to : to,
      show: show === undefined ? DEFAULT_VIEW.show : show,
    },
    ctx,
  );
}

function sameShow(a: readonly string[] | null, b: readonly string[] | null): boolean {
  if (a === null || b === null) return a === b;
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

/**
 * The query string for a view, without the leading "?", or "" for the default.
 * Built by hand so the lane list keeps readable commas instead of %2C.
 */
export function serializeView(view: TimelineView, ctx: ViewContext): string {
  const current = normalizeView(view, ctx);
  const fallback = normalizeView(DEFAULT_VIEW, ctx);
  const params: string[] = [];
  if (current.from !== fallback.from) params.push(`from=${current.from}`);
  if (current.to !== fallback.to) params.push(`to=${current.to ?? "now"}`);
  if (!sameShow(current.show, fallback.show)) {
    let show = "all";
    if (current.show !== null) show = current.show.length === 0 ? "none" : current.show.join(",");
    params.push(`show=${show}`);
  }
  return params.join("&");
}

/** True when two views draw the same chart. */
export function sameView(a: TimelineView, b: TimelineView, ctx: ViewContext): boolean {
  return serializeView(a, ctx) === serializeView(b, ctx);
}
