import { describe, expect, it } from "vitest";
import { buildOverview, type OverviewInputs } from "./overview";

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);
const now = utc("2026-10-18");

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
  });

  it("orders lanes: employers newest first with their concurrent roles, then projects, then wins", () => {
    expect(overview.lanes.map((l) => l.label)).toEqual(["Acme", "Concurrent", "School", "Work projects", "Wins"]);
  });

  it("starts the axis on 1 January of the earliest year and marks the current role", () => {
    expect(overview.years[0]).toEqual({ year: 2017, position: 2 });
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
    const late = buildOverview({ roles, accomplishments: [win("late", "2026-09-01", undefined, "A long label here")], workProjects: [], now });
    const [item] = late.lanes.at(-1)!.items;
    expect(item.flip).toBe(true);
    expect(overview.lanes.at(-1)!.items.every((i) => !i.flip)).toBe(true);
  });

  it("describes items in full for screen readers", () => {
    expect(overview.lanes[0].items[1].description).toBe("eng, Acme, Oct 2019 – Jan 2025");
  });
});
