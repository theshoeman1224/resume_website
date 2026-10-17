import type { PROJECT_STATUSES } from "./project-vocabulary.js";

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  complete: "Complete",
  experimental: "Experimental",
  prototype: "Prototype",
  archived: "Archived",
};

export interface DemoSource {
  slug: string;
  demoAdapter?: string;
  demo: { type: string; url?: string };
}

/**
 * Where a project's "live demo" link should point, or undefined when it has
 * none. An external demo hosted on this site itself is not a demo link.
 */
export function projectDemoUrl(
  project: DemoSource,
  options: { site?: URL | string; onDetailPage?: boolean } = {},
): string | undefined {
  if (project.demoAdapter === "snake") {
    return options.onDetailPage ? "#play" : `/projects/${project.slug}/#play`;
  }
  if (project.demo.type !== "external" || !project.demo.url) return undefined;
  if (options.site && new URL(project.demo.url).origin === new URL(options.site).origin) {
    return undefined;
  }
  return project.demo.url;
}
