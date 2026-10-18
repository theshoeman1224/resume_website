import { describe, expect, it } from "vitest";
import {
  accomplishmentsForProject,
  accomplishmentsForRole,
  byId,
  careerRelations,
  findCurrentRole,
  groupByEmployer,
  projectsForRole,
  yearsBetween,
  roleLinks,
  sortRolesNewestFirst,
  validateCareerGraph,
  type AccomplishmentLike,
  type RoleLike,
  type WorkProjectLike,
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

function project(id: string, start: string, roles: string[], end?: string): WorkProjectLike {
  return { id, data: { title: id, organization: "Org", startDate: utc(start), endDate: end ? utc(end) : undefined, roles } };
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

describe("accomplishmentsForRole", () => {
  const items = byId([
    accomplishment("older", "r", "2020-01-01", "DSP"),
    accomplishment("newer", "r", "2022-01-01", "Embedded"),
    accomplishment("also-dsp", "r", "2021-01-01", "DSP"),
  ]);
  const r = role("r", "2019-01-01", { accomplishments: ["older", "missing", "newer", "also-dsp"] });

  it("resolves IDs newest first and skips unknown ones", () => {
    expect(accomplishmentsForRole(r, items).map((a) => a.id)).toEqual(["newer", "also-dsp", "older"]);
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

describe("validateCareerGraph: work projects and concurrent roles", () => {
  const eng = role("eng", "2019-01-01", { endDate: utc("2025-01-01"), accomplishments: ["fix"] });
  const ops = role("ops", "2019-01-01", { endDate: utc("2025-01-01"), track: "concurrent" });

  it("accepts a concurrent role that overlaps a primary role and a known work project", () => {
    const fix = { ...accomplishment("fix", "eng", "2022-01-01"), data: { ...accomplishment("fix", "eng", "2022-01-01").data, workProject: "radar" } };
    expect(() => validateCareerGraph([eng, ops], [fix], [project("radar", "2021-01-01", ["eng"])])).not.toThrow();
  });

  it("reports an unknown work project and a project naming an unknown role", () => {
    const fix = { ...accomplishment("fix", "eng", "2022-01-01"), data: { ...accomplishment("fix", "eng", "2022-01-01").data, workProject: "ghost" } };
    expect(() => validateCareerGraph([eng], [fix], [project("radar", "2021-01-01", ["nobody"])])).toThrow(
      /unknown work project "ghost"[\s\S]*work project "radar" lists unknown role "nobody"/,
    );
  });

  it("reports a concurrent role with no overlapping primary role at its organization", () => {
    const stray = role("stray", "2026-01-01", { track: "concurrent" });
    const elsewhere = role("elsewhere", "2019-06-01", { track: "concurrent", organization: "Other" });
    const message = (() => {
      try {
        validateCareerGraph([{ ...eng, data: { ...eng.data, accomplishments: [] } }, stray, elsewhere], []);
        return "";
      } catch (error) {
        return (error as Error).message;
      }
    })();
    expect(message).toMatch(/concurrent role "stray" does not overlap/);
    expect(message).toMatch(/concurrent role "elsewhere" does not overlap/);
  });
});

describe("groupByEmployer", () => {
  const now = utc("2026-10-01");
  const roles = [
    role("ra", "2017-05-01", { endDate: utc("2018-01-01"), organization: "School" }),
    role("eng", "2019-10-01", { endDate: utc("2025-01-01"), organization: "Acme", order: 20 }),
    role("ops", "2019-10-01", { endDate: utc("2025-01-01"), organization: "Acme", order: 21, track: "concurrent" }),
    role("lead", "2025-01-01", { endDate: utc("2026-03-01"), organization: "Acme", promotion: true }),
    role("principal", "2026-03-01", { organization: "Acme", promotion: true }),
  ];

  it("groups contiguous same-organization roles, newest group first", () => {
    const groups = groupByEmployer(roles, now);
    expect(groups.map((g) => g.organization)).toEqual(["Acme", "School"]);
    expect(groups[0].roles.map(({ role: r }) => r.id)).toEqual(["principal", "lead", "eng"]);
  });

  it("nests a concurrent role under the role it overlaps most", () => {
    const [acme] = groupByEmployer(roles, now);
    expect(acme.roles.find(({ role: r }) => r.id === "eng")?.concurrent.map((r) => r.id)).toEqual(["ops"]);
    expect(acme.roles.every(({ role: r }) => r.id !== "ops")).toBe(true);
  });

  it("spans the group and counts promotions", () => {
    const [acme, school] = groupByEmployer(roles, now);
    expect(acme.startDate).toEqual(utc("2019-10-01"));
    expect(acme.endDate).toBeUndefined();
    expect(acme.promotions).toBe(2);
    expect(school.endDate).toEqual(utc("2018-01-01"));
  });

  it("keeps a concurrent role with no host as its own entry", () => {
    const groups = groupByEmployer([role("solo", "2020-01-01", { track: "concurrent", organization: "X" })], now);
    expect(groups[0].roles.map(({ role: r }) => r.id)).toEqual(["solo"]);
  });

  it("starts a new group when an organization comes back after another", () => {
    const boomerang = [
      role("a1", "2018-01-01", { endDate: utc("2019-01-01"), organization: "A" }),
      role("b", "2019-01-01", { endDate: utc("2020-01-01"), organization: "B" }),
      role("a2", "2020-01-01", { organization: "A" }),
    ];
    expect(groupByEmployer(boomerang, now).map((g) => g.organization)).toEqual(["A", "B", "A"]);
  });
});

describe("project links", () => {
  it("finds a project's accomplishments newest first", () => {
    const withProject = (id: string, date: string, workProject?: string): AccomplishmentLike => ({
      id,
      data: { ...accomplishment(id, "r", date).data, workProject },
    });
    const items = [withProject("old", "2020-01-01", "p"), withProject("other", "2021-01-01"), withProject("new", "2022-01-01", "p")];
    expect(accomplishmentsForProject("p", items).map((a) => a.id)).toEqual(["new", "old"]);
  });

  it("finds a role's projects newest first", () => {
    const projects = [project("old", "2019-01-01", ["r"]), project("none", "2020-01-01", ["x"]), project("new", "2021-01-01", ["r", "x"])];
    expect(projectsForRole("r", projects).map((p) => p.id)).toEqual(["new", "old"]);
  });
});

describe("yearsBetween", () => {
  it("counts whole months as years to one decimal", () => {
    expect(yearsBetween(utc("2019-10-01"), utc("2026-03-01"))).toBe(6.4);
    expect(yearsBetween(utc("2020-01-01"), utc("2020-01-31"))).toBe(0);
  });
});

describe("careerRelations", () => {
  it("links wins to their role, related roles and project, and projects to their roles", () => {
    const win = { ...accomplishment("fix", "eng", "2022-01-01", "DSP", ["ops"]) };
    win.data = { ...win.data, workProject: "radar" };
    const relations = careerRelations(
      [role("eng", "2019-01-01"), role("ops", "2019-01-01"), role("idle", "2018-01-01")],
      [win],
      [project("radar", "2021-01-01", ["eng"])],
    );
    expect(relations.get("win-fix")).toEqual(["role-eng", "role-ops", "work-radar"]);
    expect(relations.get("role-eng")).toEqual(["win-fix", "work-radar"]);
    expect(relations.get("work-radar")).toEqual(["role-eng", "win-fix"]);
    expect(relations.get("role-idle")).toEqual([]);
  });
});
