import { describe, expect, it } from "vitest";
import { PROJECT_STATUSES } from "./project-vocabulary.js";
import { PROJECT_STATUS_LABELS, projectDemoUrl } from "./projects";

describe("PROJECT_STATUS_LABELS", () => {
  it("has a label for every status the schema allows", () => {
    expect(Object.keys(PROJECT_STATUS_LABELS).sort()).toEqual([...PROJECT_STATUSES].sort());
  });
});

describe("projectDemoUrl", () => {
  const site = "https://joshshuman.com";

  it("points Snake at its embedded player", () => {
    const snake = { slug: "rust-wasm-snake", demoAdapter: "snake", demo: { type: "wasm" } };
    expect(projectDemoUrl(snake)).toBe("/projects/rust-wasm-snake/#play");
    expect(projectDemoUrl(snake, { onDetailPage: true })).toBe("#play");
  });

  it("links external demos on other sites", () => {
    const project = { slug: "x", demo: { type: "external", url: "https://example.com/demo" } };
    expect(projectDemoUrl(project, { site })).toBe("https://example.com/demo");
  });

  it("drops an external demo that is this site itself", () => {
    const project = { slug: "resume-website", demo: { type: "external", url: "https://joshshuman.com" } };
    expect(projectDemoUrl(project, { site: new URL(site) })).toBeUndefined();
  });

  it("returns nothing for projects without a demo", () => {
    expect(projectDemoUrl({ slug: "x", demo: { type: "none" } }, { site })).toBeUndefined();
  });
});
