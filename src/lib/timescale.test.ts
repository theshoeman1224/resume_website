import { describe, expect, it } from "vitest";
import { createScale, packLanes, timePosition, yearMarkers } from "./timescale";

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);

describe("timePosition", () => {
  const start = utc("2020-01-01");
  const end = utc("2030-01-01");

  it("maps the range onto the padded track", () => {
    expect(timePosition(start, start, end, 10)).toBe(10);
    expect(timePosition(end, start, end, 10)).toBe(90);
    expect(timePosition(utc("2025-01-01"), start, end, 10)).toBeCloseTo(50, 0);
  });

  it("centres a zero-length range instead of dividing by zero", () => {
    expect(timePosition(start, start, start)).toBe(50);
  });
});

describe("createScale", () => {
  const rangeStart = utc("2015-01-01");
  const rangeEnd = utc("2027-01-01");
  const focused = createScale({ rangeStart, rangeEnd, focus: { start: utc("2019-01-01"), end: rangeEnd }, padding: 0 });

  it("is linear without a focus, or with one covering the whole range", () => {
    const plain = createScale({ rangeStart, rangeEnd, padding: 0 });
    const covering = createScale({ rangeStart, rangeEnd, focus: { start: utc("2010-01-01"), end: utc("2030-01-01") }, padding: 0 });
    for (const scale of [plain, covering]) {
      expect(scale.at(utc("2021-01-01"))).toBeCloseTo(50, 1);
      expect(scale.bands).toEqual([]);
      expect(scale.inFocus(utc("2015-06-01"))).toBe(true);
    }
  });

  it("gives the focus its share of the track and the rest to the compressed band", () => {
    expect(focused.at(rangeStart)).toBe(0);
    expect(focused.at(utc("2019-01-01"))).toBeCloseTo(10);
    expect(focused.at(rangeEnd)).toBeCloseTo(100);
    expect(focused.bands).toEqual([{ start: 0, end: expect.closeTo(10) }]);
    expect(focused.inFocus(utc("2018-12-31"))).toBe(false);
    expect(focused.inFocus(utc("2019-01-01"))).toBe(true);
  });

  it("tells whether a span reaches into the focus", () => {
    expect(focused.overlapsFocus(utc("2016-01-01"), utc("2018-06-01"))).toBe(false);
    // Ending the day the focus starts only touches it.
    expect(focused.overlapsFocus(utc("2016-01-01"), utc("2019-01-01"))).toBe(false);
    expect(focused.overlapsFocus(utc("2016-01-01"), utc("2020-01-01"))).toBe(true);
    expect(focused.overlapsFocus(utc("2016-01-01"), null)).toBe(true);
    expect(focused.overlapsFocus(utc("2019-01-01"))).toBe(true);
    expect(focused.overlapsFocus(utc("2018-01-01"))).toBe(false);
  });

  it("splits the compressed share between both sides of a focus in the middle", () => {
    const middle = createScale({ rangeStart, rangeEnd, focus: { start: utc("2018-01-01"), end: utc("2024-01-01") }, padding: 0 });
    // 3 years before, 3 after: 5% each.
    expect(middle.at(utc("2018-01-01"))).toBeCloseTo(5);
    expect(middle.at(utc("2024-01-01"))).toBeCloseTo(95);
    expect(middle.bands).toHaveLength(2);
  });

  it("never squeezes the focus below its linear share", () => {
    const wide = createScale({ rangeStart, rangeEnd, focus: { start: utc("2015-07-01"), end: rangeEnd }, padding: 0 });
    expect(wide.at(utc("2015-07-01"))).toBeCloseTo(timePosition(utc("2015-07-01"), rangeStart, rangeEnd, 0));
  });

  it("increases monotonically and extends past the range ends", () => {
    const dates = ["2014-01-01", "2015-01-01", "2017-01-01", "2019-01-01", "2023-01-01", "2027-01-01", "2028-01-01"].map(utc);
    const positions = dates.map((d) => focused.at(d));
    positions.slice(1).forEach((p, i) => expect(p).toBeGreaterThan(positions[i]));
  });
});

describe("yearMarkers", () => {
  it("places one marker per January inside the range", () => {
    const markers = yearMarkers(utc("2017-05-01"), utc("2020-06-01"));
    expect(markers.map((m) => m.year)).toEqual([2018, 2019, 2020]);
    expect(markers[0].position).toBeLessThan(markers[1].position);
  });

  it("flags compressed years and drops crowded labels there first", () => {
    const rangeStart = utc("2010-01-01");
    const rangeEnd = utc("2027-01-01");
    const scale = createScale({ rangeStart, rangeEnd, focus: { start: utc("2024-01-01"), end: rangeEnd } });
    const markers = yearMarkers(rangeStart, rangeEnd, scale, 4);
    const byYear = Object.fromEntries(markers.map((m) => [m.year, m]));
    expect(byYear[2010].compressed).toBe(true);
    expect(byYear[2024].compressed).toBe(false);
    expect(markers.filter((m) => !m.compressed).every((m) => m.labelled)).toBe(true);
    expect(markers.filter((m) => m.compressed).some((m) => !m.labelled)).toBe(true);
    const labelled = markers.filter((m) => m.labelled).map((m) => m.position).sort((a, b) => a - b);
    labelled.slice(1).forEach((p, i) => expect(p - labelled[i]).toBeGreaterThanOrEqual(4));
  });
});

describe("packLanes", () => {
  it("keeps non-overlapping intervals on one row", () => {
    expect(packLanes([{ start: 0, end: 10 }, { start: 10, end: 20 }, { start: 30, end: 40 }])).toEqual([0, 0, 0]);
  });

  it("stacks overlapping intervals and reuses freed rows", () => {
    const lanes = packLanes([
      { start: 0, end: 50 },
      { start: 10, end: 20 },
      { start: 25, end: 60 },
      { start: 55, end: 70 },
    ]);
    expect(lanes).toEqual([0, 1, 1, 0]);
  });

  it("places by start date but returns lanes in input order", () => {
    expect(packLanes([{ start: 20, end: 30 }, { start: 0, end: 25 }])).toEqual([1, 0]);
  });

  it("requires the gap between neighbours on a row", () => {
    expect(packLanes([{ start: 0, end: 10 }, { start: 11, end: 20 }], 2)).toEqual([0, 1]);
  });
});
