import { describe, expect, it } from "vitest";
import {
  accomplishmentsForRole,
  byId,
  findCurrentRole,
  roleCategories,
  roleLinks,
  sortRolesNewestFirst,
  validateCareerGraph,
  type AccomplishmentLike,
  type RoleLike,
} from "./career";

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);

function role(id: string, start: string, opts: Partial<RoleLike["data"]> = {}): RoleLike {
  return {
    id,
    data: { title: id, organization: "Org", startDate: utc(start), order: 0, accomplishments: [], ...opts },
  };
}

function accomplishment(id: string, roleId: string, date: string, category = "DSP", relatedRoles: string[] = []): AccomplishmentLike {
  return { id, data: { date: utc(date), category, roleId, relatedRoles } };
}

describe("sortRolesNewestFirst", () => {
  it("orders by start date, then by order for ties", () => {
    const roles = [
      role("old", "2017-05-01"),
      role("tie-low", "2019-10-01", { order: 20 }),
      role("tie-high", "2019-10-01", { order: 21 }),
      role("new", "2026-03-01"),
    ];
    expect(sortRolesNewestFirst(roles).map((r) => r.id)).toEqual(["new", "tie-high", "tie-low", "old"]);
  });

  it("does not mutate its input", () => {
    const roles = [role("a", "2017-01-01"), role("b", "2020-01-01")];
    sortRolesNewestFirst(roles);
    expect(roles.map((r) => r.id)).toEqual(["a", "b"]);
  });
});

describe("findCurrentRole", () => {
  it("returns the newest role without an end date", () => {
    const roles = [
      role("ended", "2025-01-01", { endDate: utc("2026-03-01") }),
      role("side-gig", "2020-01-01"),
      role("current", "2026-03-01"),
    ];
    expect(findCurrentRole(roles)?.id).toBe("current");
  });

  it("returns undefined when every role has ended", () => {
    expect(findCurrentRole([role("a", "2020-01-01", { endDate: utc("2021-01-01") })])).toBeUndefined();
  });
});

describe("accomplishmentsForRole and roleCategories", () => {
  const items = byId([
    accomplishment("older", "r", "2020-01-01", "DSP"),
    accomplishment("newer", "r", "2022-01-01", "Embedded"),
    accomplishment("also-dsp", "r", "2021-01-01", "DSP"),
  ]);
  const r = role("r", "2019-01-01", { accomplishments: ["older", "missing", "newer", "also-dsp"] });

  it("resolves IDs newest first and skips unknown ones", () => {
    expect(accomplishmentsForRole(r, items).map((a) => a.id)).toEqual(["newer", "also-dsp", "older"]);
  });

  it("lists each category once, sorted", () => {
    expect(roleCategories(r, items)).toEqual(["DSP", "Embedded"]);
  });
});

describe("roleLinks", () => {
  it("maps known IDs to title and organization", () => {
    const roles = byId([role("a", "2020-01-01", { title: "Lead", organization: "Acme" })]);
    expect(roleLinks(["a", "nope"], roles)).toEqual([{ id: "a", title: "Lead", organization: "Acme" }]);
  });
});

describe("validateCareerGraph", () => {
  const roles = [
    role("eng", "2019-01-01", { accomplishments: ["dsp"] }),
    role("lead", "2020-01-01", { accomplishments: ["ops"] }),
  ];
  const accomplishments = [accomplishment("dsp", "eng", "2020-01-01", "DSP", ["lead"]), accomplishment("ops", "lead", "2021-01-01")];

  it("accepts consistent content", () => {
    expect(() => validateCareerGraph(roles, accomplishments)).not.toThrow();
  });

  it("reports a role listing a missing accomplishment", () => {
    const broken = [role("eng", "2019-01-01", { accomplishments: ["dsp", "ghost"] }), roles[1]];
    expect(() => validateCareerGraph(broken, accomplishments)).toThrow(/missing accomplishment "ghost"/);
  });

  it("reports an unknown roleId and an unknown related role", () => {
    const broken = [...accomplishments, accomplishment("stray", "nobody", "2021-01-01", "DSP", ["ghost-role"])];
    expect(() => validateCareerGraph(roles, broken)).toThrow(/unknown roleId "nobody"[\s\S]*unknown related role "ghost-role"/);
  });

  it("reports ownership disagreements in both directions", () => {
    const listedByWrongRole = [role("eng", "2019-01-01", { accomplishments: ["dsp", "ops"] }), role("lead", "2020-01-01")];
    const message = (() => {
      try {
        validateCareerGraph(listedByWrongRole, accomplishments);
        return "";
      } catch (error) {
        return (error as Error).message;
      }
    })();
    expect(message).toMatch(/role "eng" lists accomplishment "ops", whose roleId is "lead"/);
    expect(message).toMatch(/accomplishment "ops" is not listed by its role "lead"/);
  });
});
