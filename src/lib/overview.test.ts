import { describe, expect, it } from "vitest";
import { buildOverview, parseOverviewInputs, serializeOverviewInputs, type OverviewInputs } from "./overview";
import type { TimelineView } from "./timeline-view";

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);
const now = utc("2026-10-18");
/** Every lane, no focus: the plain linear chart. */
const ALL: TimelineView = { from: 0, to: null, show: null };

type RoleIn = OverviewInputs["roles"][number];
type WinIn = OverviewInputs["accomplishments"][number];

function role(id: string, start: string, end: string | undefined, extra: Partial<RoleIn["data"]> = {}): RoleIn {
  return {
    id,
    data: { title: id, organization: "Acme", startDate: utc(start), endDate: end ? utc(end) : undefined, order: 0, accomplishments: [], ...extra },
  };
}

function win(id: string, date: string, endDate?: string, shortTitle?: string): WinIn {
  return { id, data: { title: id, shortTitle, date: utc(date), endDate: endDate ? utc(endDate) : undefined, category: "X", roleId: "eng", relatedRoles: [] } };
}

const roles = [
  role("eng", "2019-10-01", "2025-01-01"),
  role("ops", "2019-10-01", "2025-01-01", { track: "concurrent" }),
  role("principal", "2025-01-01", undefined, { shortTitle: "Principal" }),
  role("ra", "2017-05-01", "2018-01-01", { organization: "School" }),
];

describe("buildOverview", () => {
  const overview = buildOverview({
    roles,
    accomplishments: [win("boot", "2022-02-01", "2022-02-01"), win("race", "2022-03-01"), win("dsp", "2019-10-01", "2025-01-01")],
    workProjects: [{ id: "radar", data: { title: "Radar", organization: "Acme", startDate: utc("2025-01-01"), roles: ["principal"] } }],
    now,
  }, ALL);

  it("orders lanes: employers newest first with their concurrent roles, then projects, then wins", () => {
    expect(overview.lanes.map((l) => l.label)).toEqual(["Acme", "Concurrent", "School", "Work projects", "Wins"]);
  });

  it("starts the axis on 1 January of the earliest year and marks the current role", () => {
    expect(overview.years[0]).toEqual({ year: 2017, position: 2, compressed: false, labelled: true });
    const acme = overview.lanes[0].items;
    expect(acme.map((i) => [i.key, i.kind, i.label])).toEqual([
      ["role-principal", "current", "Principal"],
      ["role-eng", "role", "eng"],
    ]);
  });

  it("runs ongoing bars to the end of the track and keeps consecutive roles on one row", () => {
    const [principal, eng] = overview.lanes[0].items;
    expect(principal.end).toBe(100);
    expect(principal.ongoing).toBe(true);
    expect(eng.end).toBeCloseTo(principal.start);
    expect(overview.lanes[0].rows).toBe(1);
    expect(overview.now).toBeLessThan(100);
  });

  it("draws single-month wins as points and stacks wins whose labels would collide", () => {
    const wins = overview.lanes.at(-1)!.items;
    const byKey = Object.fromEntries(wins.map((w) => [w.key, w]));
    expect(byKey["win-boot"].point).toBe(true);
    expect(byKey["win-race"].point).toBe(true);
    expect(byKey["win-dsp"].point).toBe(false);
    expect(byKey["win-boot"].row).not.toBe(byKey["win-race"].row);
  });

  it("flips a win label to the left of its marker near the right edge", () => {
    const late = buildOverview({ roles, accomplishments: [win("late", "2026-09-01", undefined, "A long label here")], workProjects: [], now }, ALL);
    const [item] = late.lanes.at(-1)!.items;
    expect(item.flip).toBe(true);
    expect(overview.lanes.at(-1)!.items.every((i) => !i.flip)).toBe(true);
  });

  it("describes items in full for screen readers", () => {
    expect(overview.lanes[0].items[1].description).toBe("eng, Acme, Oct 2019 – Jan 2025");
  });

  it("drops the label from bars too short to hold one", () => {
    const withCoop = buildOverview({
      roles: [...roles, role("coop", "2018-09-01", "2018-12-01", { organization: "Co-op Inc" })],
      accomplishments: [],
      workProjects: [],
      now,
    }, ALL);
    const compact = (key: string) => withCoop.lanes.flatMap((l) => l.items).find((i) => i.key === key)!.compact;
    expect(compact("role-coop")).toBe(true);
    expect(compact("role-ra")).toBe(false);
    expect(compact("role-eng")).toBe(false);
  });
});

describe("buildOverview with a view", () => {
  const inputs: OverviewInputs = {
    roles: [
      ...roles,
      role("intern", "2016-06-01", "2016-09-01", { organization: "Co-op Inc", accomplishments: ["early"] }),
    ],
    accomplishments: [
      win("boot", "2022-02-01", "2022-02-01", "Boot"),
      { ...win("early", "2016-07-01", undefined, "Early win"), data: { ...win("early", "2016-07-01").data, shortTitle: "Early win", roleId: "intern" } },
    ],
    workProjects: [
      { id: "radar", data: { title: "Radar", organization: "Acme", startDate: utc("2025-01-01"), roles: ["principal"] } },
      { id: "loose", data: { title: "Loose", organization: "Acme", startDate: utc("2023-01-01"), endDate: utc("2024-01-01"), roles: [] } },
    ],
    now,
  };
  const item = (overview: ReturnType<typeof buildOverview>, key: string) =>
    overview.lanes.flatMap((l) => l.items).find((i) => i.key === key)!;

  it("gives lanes stable ids from their organization", () => {
    expect(buildOverview(inputs, ALL).context.laneIds).toEqual(["acme", "acme-concurrent", "school", "co-op-inc", "projects", "wins"]);
  });

  it("hides lanes left out of the view, and the wins and projects of their roles", () => {
    const overview = buildOverview(inputs, { from: 2016, to: null, show: ["school", "projects", "wins"] });
    expect(overview.lanes.filter((l) => l.hidden).map((l) => l.id)).toEqual(["acme", "acme-concurrent", "co-op-inc", "wins"]);
    expect(item(overview, "win-boot").hidden).toBe(true);
    expect(item(overview, "win-early").hidden).toBe(true);
    expect(item(overview, "work-radar").hidden).toBe(true);
    // A project tied to no role is only governed by its own lane.
    expect(item(overview, "work-loose").hidden).toBe(false);
  });

  it("hides a lane whose items are all hidden by their roles", () => {
    const overview = buildOverview({ ...inputs, workProjects: [] }, { from: 2016, to: null, show: ["school", "wins"] });
    expect(overview.lanes.find((l) => l.id === "wins")!.hidden).toBe(true);
  });

  it("packs only visible items, so hidden ones leave no empty rows", () => {
    const stacked = buildOverview(
      { ...inputs, accomplishments: [win("a", "2022-02-01", undefined, "Label A"), { ...win("b", "2022-02-01"), data: { ...win("b", "2022-02-01").data, roleId: "ra" } }] },
      { from: 2016, to: null, show: ["acme", "wins"] },
    );
    const wins = stacked.lanes.find((l) => l.id === "wins")!;
    expect(wins.rows).toBe(1);
    expect(item(stacked, "win-a").row).toBe(0);
  });

  it("widens the focused years and compresses the rest", () => {
    const linear = buildOverview(inputs, ALL);
    const focused = buildOverview(inputs, { from: 2019, to: null, show: null });
    const width = (o: ReturnType<typeof buildOverview>) => item(o, "role-eng").end - item(o, "role-eng").start;
    expect(width(focused)).toBeGreaterThan(width(linear));
    expect(focused.bands).toHaveLength(1);
    expect(focused.years.find((y) => y.year === 2017)!.compressed).toBe(true);
    expect(focused.years.find((y) => y.year === 2019)!.compressed).toBe(false);
    expect(linear.bands).toEqual([]);
  });

  it("draws wins inside a compressed band as unlabelled dots", () => {
    const focused = buildOverview(inputs, { from: 2019, to: null, show: null });
    expect(item(focused, "win-early").compact).toBe(true);
    expect(item(focused, "win-boot").compact).toBe(false);
    expect(item(buildOverview(inputs, ALL), "win-early").compact).toBe(false);
  });

  it("drops the label from bars wholly inside a compressed band, but not from ones reaching into the focus", () => {
    const focused = buildOverview(inputs, { from: 2019, to: null, show: null });
    expect(item(focused, "role-ra").compact).toBe(true);
    expect(item(focused, "role-eng").compact).toBe(false);
    expect(item(buildOverview(inputs, ALL), "role-ra").compact).toBe(false);
  });

  it("uses the default view when none is given", () => {
    const overview = buildOverview(inputs);
    expect(overview.view.from).toBe(2019);
    expect(overview.view.show).toEqual(["projects", "wins"]);
  });

  it("round-trips its inputs through JSON for the browser", () => {
    const parsed = parseOverviewInputs(serializeOverviewInputs(inputs));
    expect(parsed.now).toEqual(now);
    expect(buildOverview(parsed, ALL)).toEqual(buildOverview(inputs, ALL));
  });
});
