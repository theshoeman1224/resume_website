import { describe, expect, it } from "vitest";
import { spinePosition, spreadPositions, yearMarkers } from "./spine";

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);

describe("spinePosition", () => {
  const start = utc("2020-01-01");
  const end = utc("2030-01-01");

  it("maps the range onto the padded track", () => {
    expect(spinePosition(start, start, end)).toBe(10);
    expect(spinePosition(end, start, end)).toBe(90);
    expect(spinePosition(utc("2025-01-01"), start, end)).toBeCloseTo(50, 0);
  });

  it("centres a zero-length range instead of dividing by zero", () => {
    expect(spinePosition(start, start, start)).toBe(50);
  });
});

describe("spreadPositions", () => {
  it("leaves well-separated markers alone", () => {
    expect(spreadPositions([10, 40, 80], 3)).toEqual([10, 40, 80]);
  });

  it("splits identical positions symmetrically around the original point", () => {
    const [a, b] = spreadPositions([30, 30], 4);
    expect(a).toBeCloseTo(28);
    expect(b).toBeCloseTo(32);
  });

  it("keeps input order and enforces the gap through chains", () => {
    const result = spreadPositions([50, 49, 51, 90], 3);
    const sorted = [...result.slice(0, 3)].sort((x, y) => x - y);
    expect(sorted[1] - sorted[0]).toBeCloseTo(3);
    expect(sorted[2] - sorted[1]).toBeCloseTo(3);
    expect(result[1]).toBeLessThan(result[0]);
    expect(result[0]).toBeLessThan(result[2]);
    expect(result[3]).toBe(90);
  });

  it("re-spreads when one group pushes into its neighbour", () => {
    const result = [...spreadPositions([20, 20, 20, 23], 2)].sort((x, y) => x - y);
    for (let i = 1; i < result.length; i += 1) {
      expect(result[i] - result[i - 1]).toBeGreaterThanOrEqual(2 - 1e-9);
    }
  });
});

describe("yearMarkers", () => {
  it("places one marker per January inside the range", () => {
    const markers = yearMarkers(utc("2017-05-01"), utc("2020-06-01"));
    expect(markers.map((m) => m.year)).toEqual([2018, 2019, 2020]);
    expect(markers.every((m) => m.labelled)).toBe(true);
  });

  it("drops the label where a role marker already sits", () => {
    const start = utc("2020-01-01");
    const end = utc("2030-01-01");
    const at2025 = spinePosition(utc("2025-01-01"), start, end);
    const markers = yearMarkers(start, end, [at2025 + 1], 3);
    expect(markers.find((m) => m.year === 2025)?.labelled).toBe(false);
    expect(markers.find((m) => m.year === 2024)?.labelled).toBe(true);
  });
});
