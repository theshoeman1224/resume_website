import { describe, expect, it } from "vitest";
import { validateProject } from "./validate-project.mjs";

const repo = "owner/example";

function document(overrides = {}) {
  return {
    schema_version: 1,
    project: {
      name: " Example ",
      slug: "example-project",
      tagline: "Tagline",
      summary: "Summary",
      description: "Description",
      status: "active",
      role: "Developer",
      dates: { started: new Date("2026-08-08T00:00:00Z"), completed: null },
      technologies: ["Rust"],
      categories: ["Games"],
      highlights: ["One", "Two", "Three"],
      links: {
        repository: "https://github.com/owner/example",
        primary: [{ name: "Docs", type: "documentation", url: "https://example.com/docs" }],
      },
      demo: { type: "none" },
      ...overrides,
    },
  };
}

describe("validateProject", () => {
  it("normalizes a valid document", () => {
    const project = validateProject(document(), repo);
    expect(project.name).toBe("Example");
    expect(project.dates).toEqual({ started: "2026-08-08", completed: undefined });
    expect(project.links.dashboards).toEqual([]);
  });

  it("rejects the wrong schema version", () => {
    expect(() => validateProject({ ...document(), schema_version: 2 }, repo)).toThrow(/schema_version 1/);
  });

  it("rejects slugs that are not URL-safe", () => {
    expect(() => validateProject(document({ slug: "Not Safe" }), repo)).toThrow(/slug is not URL-safe/);
  });

  it("rejects unknown statuses", () => {
    expect(() => validateProject(document({ status: "abandoned" }), repo)).toThrow(/unsupported project.status/);
  });

  it("requires three to six highlights", () => {
    expect(() => validateProject(document({ highlights: ["One", "Two"] }), repo)).toThrow(/highlights must contain 3-6/);
    expect(() => validateProject(document({ highlights: Array(7).fill("x") }), repo)).toThrow(/highlights/);
  });

  it("requires HTTPS links", () => {
    const links = { repository: "https://github.com/owner/example", primary: [{ name: "a", type: "b", url: "http://example.com" }] };
    expect(() => validateProject(document({ links }), repo)).toThrow(/must use HTTPS/);
  });

  it("requires the fields each demo type needs", () => {
    expect(() => validateProject(document({ demo: { type: "wasm" } }), repo)).toThrow(/demo.build_command/);
    expect(() => validateProject(document({ demo: { type: "external", url: "http://x.com" } }), repo)).toThrow(/HTTPS/);
    expect(() => validateProject(document({ demo: { type: "hologram" } }), repo)).toThrow(/demo.type is invalid/);
  });
});
