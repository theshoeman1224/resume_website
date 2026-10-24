import { describe, expect, it } from "vitest";
import { DEFAULT_VIEW, fullCareerView, laneSlug, normalizeView, parseView, sameView, serializeView, type ViewContext } from "./timeline-view";

const ctx: ViewContext = {
  laneIds: ["raytheon", "raytheon-concurrent", "wentworth-institute-of-technology", "olympus", "j-m-brown", "projects", "wins"],
  firstYear: 2015,
  lastYear: 2026,
};
const parse = (query: string) => parseView(new URLSearchParams(query), ctx);

describe("laneSlug", () => {
  it("lowercases and joins words with hyphens", () => {
    expect(laneSlug("J&M Brown")).toBe("j-m-brown");
    expect(laneSlug("Wentworth Institute of Technology")).toBe("wentworth-institute-of-technology");
  });
});

describe("parseView", () => {
  it("returns the default for an empty query", () => {
    expect(parse("")).toEqual(DEFAULT_VIEW);
  });

  it("reads years and rows", () => {
    expect(parse("from=2021&to=2024&show=wins,raytheon")).toEqual({ from: 2021, to: 2024, show: ["raytheon", "wins"] });
    expect(parse("show=all").show).toBeNull();
    expect(parse("show=none").show).toEqual([]);
    expect(parse("to=now").to).toBeNull();
  });

  it("falls back to the default for each unusable param on its own", () => {
    expect(parse("from=soon&show=nope,also-nope&to=2023")).toEqual({ ...DEFAULT_VIEW, to: 2023 });
    expect(parse("show=wins,bogus").show).toEqual(["wins"]);
  });

  it("clamps years to the chart and puts them in order", () => {
    expect(parse("from=1990").from).toBe(2015);
    expect(parse("from=2024&to=2020")).toMatchObject({ from: 2020, to: 2024 });
    // The current year as the end means "through now".
    expect(parse("to=2026").to).toBeNull();
    expect(parse("to=2099").to).toBeNull();
  });
});

describe("serializeView", () => {
  it("writes nothing for the default view", () => {
    expect(serializeView(DEFAULT_VIEW, ctx)).toBe("");
    expect(serializeView({ ...DEFAULT_VIEW, show: ["wins", "projects", "raytheon-concurrent", "raytheon"] }, ctx)).toBe("");
  });

  it("writes only what differs from the default, with readable commas", () => {
    expect(serializeView({ from: 2022, to: null, show: ["raytheon", "wins"] }, ctx)).toBe("from=2022&show=raytheon,wins");
    expect(serializeView(fullCareerView(ctx), ctx)).toBe("from=2015&show=all");
    expect(serializeView({ ...DEFAULT_VIEW, to: 2023, show: [] }, ctx)).toBe("to=2023&show=none");
  });

  it("round-trips through parseView", () => {
    const views = [
      fullCareerView(ctx),
      { from: 2017, to: 2020, show: ["olympus", "wins"] },
      { ...DEFAULT_VIEW, show: [] },
      DEFAULT_VIEW,
    ];
    for (const view of views) expect(parse(serializeView(view, ctx))).toEqual(normalizeView(view, ctx));
  });
});

describe("sameView", () => {
  it("compares the charts two views draw", () => {
    expect(sameView({ ...DEFAULT_VIEW, show: [...ctx.laneIds] }, fullCareerView(ctx), ctx)).toBe(false);
    expect(sameView({ from: 2015, to: 2026, show: [...ctx.laneIds] }, fullCareerView(ctx), ctx)).toBe(true);
  });
});
