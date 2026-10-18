import { describe, expect, it } from "vitest";
import { formatDateRange, formatDuration, formatMonthYear, formatProjectDates, formatSpan, monthsBetween } from "./dates";

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);

describe("formatMonthYear", () => {
  it("uses UTC so the first of the month never slips to the previous month", () => {
    expect(formatMonthYear(utc("2019-10-01"))).toBe("Oct 2019");
  });
});

describe("formatDateRange", () => {
  it("joins two months with an en dash", () => {
    expect(formatDateRange(utc("2017-05-01"), utc("2018-01-01"))).toBe("May 2017 – Jan 2018");
  });

  it("reads Present when there is no end date", () => {
    expect(formatDateRange(utc("2026-03-01"))).toBe("Mar 2026 – Present");
  });
});

describe("formatSpan", () => {
  it("collapses a range inside one month", () => {
    expect(formatSpan(utc("2022-02-01"), utc("2022-02-01"))).toBe("Feb 2022");
    expect(formatSpan(utc("2022-02-01"), utc("2022-02-27"))).toBe("Feb 2022");
  });

  it("keeps ranges that cross months", () => {
    expect(formatSpan(utc("2022-02-01"), utc("2022-03-01"))).toBe("Feb 2022 – Mar 2022");
  });

  it("keeps open-ended ranges", () => {
    expect(formatSpan(utc("2026-03-01"))).toBe("Mar 2026 – Present");
  });
});

describe("formatProjectDates", () => {
  it("shows an ongoing project as running to the present", () => {
    expect(formatProjectDates({ started: "2026-08-08" }, true)).toBe("Aug 2026 – Present");
  });

  it("shows a finished project's full range", () => {
    expect(formatProjectDates({ started: "2025-01-10", completed: "2025-06-01" }, false)).toBe(
      "Jan 2025 – Jun 2025",
    );
  });

  it("shows only the start month for an inactive project with no end date", () => {
    expect(formatProjectDates({ started: "2024-04-02" }, false)).toBe("Apr 2024");
  });

  it("falls back to the completion month, or nothing", () => {
    expect(formatProjectDates({ completed: "2024-04-02" }, false)).toBe("Apr 2024");
    expect(formatProjectDates({}, true)).toBeUndefined();
  });
});

describe("monthsBetween and formatDuration", () => {
  const d = (iso: string) => new Date(`${iso}T00:00:00Z`);

  it("counts calendar months", () => {
    expect(monthsBetween(d("2019-10-01"), d("2025-01-01"))).toBe(63);
  });

  it("formats years and months, singular and plural", () => {
    expect(formatDuration(d("2019-10-01"), d("2025-01-01"))).toBe("5 yrs 3 mos");
    expect(formatDuration(d("2025-01-01"), d("2026-02-01"))).toBe("1 yr 1 mo");
    expect(formatDuration(d("2025-01-01"), d("2026-01-01"))).toBe("1 yr");
    expect(formatDuration(d("2026-03-01"), undefined, d("2026-10-18"))).toBe("7 mos");
  });

  it("never reads zero", () => {
    expect(formatDuration(d("2026-03-01"), d("2026-03-20"))).toBe("1 mo");
  });
});
