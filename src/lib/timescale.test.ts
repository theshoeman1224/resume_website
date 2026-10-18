import { describe, expect, it } from "vitest";
import { packLanes, timePosition, yearMarkers } from "./timescale";

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

describe("yearMarkers", () => {
  it("places one marker per January inside the range", () => {
    const markers = yearMarkers(utc("2017-05-01"), utc("2020-06-01"));
    expect(markers.map((m) => m.year)).toEqual([2018, 2019, 2020]);
    expect(markers[0].position).toBeLessThan(markers[1].position);
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
