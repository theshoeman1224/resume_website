// Pure helpers for the roles and accomplishments collections. They take the
// minimal shape they need so tests can pass plain objects instead of Astro
// collection entries.

import { monthsBetween } from "./dates";

/** primary: a job title. concurrent: a responsibility held alongside one. education: a degree. */
export type RoleTrack = "primary" | "concurrent" | "education";

export interface RoleLike {
  id: string;
  data: {
    title: string;
    organization: string;
    startDate: Date;
    endDate?: Date;
    order: number;
    accomplishments: string[];
    /** Missing means "primary" (the schema default). */
    track?: RoleTrack;
    promotion?: boolean;
  };
}

export interface WorkProjectLike {
  id: string;
  data: {
    title: string;
    organization: string;
    startDate: Date;
    endDate?: Date;
    roles: string[];
  };
}

export interface AccomplishmentLike {
  id: string;
  data: {
    date: Date;
    category: string;
    roleId: string;
    relatedRoles: string[];
    workProject?: string;
  };
}

export interface RoleLink {
  id: string;
  title: string;
  organization: string;
}

/** Newest start date first; `order` breaks ties (higher first). */
export function sortRolesNewestFirst<T extends RoleLike>(roles: readonly T[]): T[] {
  return [...roles].sort(
    (a, b) =>
      b.data.startDate.valueOf() - a.data.startDate.valueOf() || b.data.order - a.data.order,
  );
}

/** The ongoing role (no end date). If several are ongoing, the newest wins. */
export function findCurrentRole<T extends RoleLike>(roles: readonly T[]): T | undefined {
  return sortRolesNewestFirst(roles).find((role) => !role.data.endDate);
}

export function byId<T extends { id: string }>(entries: readonly T[]): Map<string, T> {
  return new Map(entries.map((entry) => [entry.id, entry]));
}

/** A role's accomplishments, newest first. Unknown IDs are skipped (validateCareerGraph reports them). */
export function accomplishmentsForRole<A extends AccomplishmentLike>(
  role: RoleLike,
  accomplishmentsById: ReadonlyMap<string, A>,
): A[] {
  return role.data.accomplishments
    .map((id) => accomplishmentsById.get(id))
    .filter((entry): entry is A => entry !== undefined)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function roleLinks(ids: readonly string[], rolesById: ReadonlyMap<string, RoleLike>): RoleLink[] {
  return ids.flatMap((id) => {
    const role = rolesById.get(id);
    return role ? [{ id, title: role.data.title, organization: role.data.organization }] : [];
  });
}

export function trackOf(role: RoleLike): RoleTrack {
  return role.data.track ?? "primary";
}

/** Milliseconds two date ranges share. An open end counts as `now`. */
export function overlapMs(
  a: { startDate: Date; endDate?: Date },
  b: { startDate: Date; endDate?: Date },
  now = new Date(),
): number {
  const start = Math.max(a.startDate.valueOf(), b.startDate.valueOf());
  const end = Math.min((a.endDate ?? now).valueOf(), (b.endDate ?? now).valueOf());
  return Math.max(0, end - start);
}

export interface RoleWithConcurrent<R extends RoleLike> {
  role: R;
  /** Responsibilities held alongside this role at the same organization. */
  concurrent: R[];
}

export interface EmployerGroup<R extends RoleLike> {
  organization: string;
  startDate: Date;
  /** Undefined while any role in the group is ongoing. */
  endDate?: Date;
  /** Primary and education roles, newest first. */
  roles: RoleWithConcurrent<R>[];
  promotions: number;
}

/**
 * Groups roles into runs at the same organization, newest run first, so a
 * promotion ladder reads as one employer. Each concurrent role is nested under
 * the same-organization role it overlaps most; one with no such host stands
 * as its own entry.
 */
export function groupByEmployer<R extends RoleLike>(roles: readonly R[], now = new Date()): EmployerGroup<R>[] {
  const sorted = sortRolesNewestFirst(roles);
  const hosts = sorted.filter((role) => trackOf(role) !== "concurrent");
  const entries = new Map<R, RoleWithConcurrent<R>>(hosts.map((role) => [role, { role, concurrent: [] }]));

  for (const role of sorted.filter((r) => trackOf(r) === "concurrent")) {
    const host = hosts
      .filter((h) => h.data.organization === role.data.organization && overlapMs(h.data, role.data, now) > 0)
      .sort((a, b) => overlapMs(b.data, role.data, now) - overlapMs(a.data, role.data, now))[0];
    if (host) entries.get(host)?.concurrent.push(role);
    else entries.set(role, { role, concurrent: [] });
  }

  const groups: EmployerGroup<R>[] = [];
  for (const entry of sortRolesNewestFirst([...entries.keys()]).map((role) => entries.get(role)!)) {
    const last = groups.at(-1);
    if (last?.organization === entry.role.data.organization) last.roles.push(entry);
    else groups.push({ organization: entry.role.data.organization, startDate: entry.role.data.startDate, roles: [entry], promotions: 0 });
  }

  for (const group of groups) {
    const all = group.roles.flatMap(({ role, concurrent }) => [role, ...concurrent]);
    group.startDate = new Date(Math.min(...all.map((role) => role.data.startDate.valueOf())));
    group.endDate = all.some((role) => !role.data.endDate)
      ? undefined
      : new Date(Math.max(...all.map((role) => role.data.endDate!.valueOf())));
    group.promotions = group.roles.filter(({ role }) => role.data.promotion).length;
  }
  return groups;
}

/** Accomplishments that name this work project, newest first. */
export function accomplishmentsForProject<A extends AccomplishmentLike>(projectId: string, accomplishments: readonly A[]): A[] {
  return accomplishments
    .filter((entry) => entry.data.workProject === projectId)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Work projects that list this role, newest first. */
export function projectsForRole<P extends WorkProjectLike>(roleId: string, projects: readonly P[]): P[] {
  return projects
    .filter((project) => project.data.roles.includes(roleId))
    .sort((a, b) => b.data.startDate.valueOf() - a.data.startDate.valueOf());
}

/** Element ids shared by the overview chart and the record, so each can link to the other. */
export const careerKey = {
  role: (id: string) => `role-${id}`,
  work: (id: string) => `work-${id}`,
  win: (id: string) => `win-${id}`,
};

/**
 * For each role, work project and accomplishment key, the keys directly linked
 * to it: a win's owning role, related roles and project, and a project's roles.
 * Used to highlight related entries together.
 */
export function careerRelations(
  roles: readonly RoleLike[],
  accomplishments: readonly AccomplishmentLike[],
  workProjects: readonly WorkProjectLike[],
): Map<string, string[]> {
  const links = new Map<string, Set<string>>();
  const node = (key: string) => {
    let set = links.get(key);
    if (!set) {
      set = new Set();
      links.set(key, set);
    }
    return set;
  };
  const link = (a: string, b: string) => {
    node(a).add(b);
    node(b).add(a);
  };

  for (const role of roles) node(careerKey.role(role.id));
  for (const { id, data } of accomplishments) {
    const win = careerKey.win(id);
    link(win, careerKey.role(data.roleId));
    for (const related of data.relatedRoles) link(win, careerKey.role(related));
    if (data.workProject) link(win, careerKey.work(data.workProject));
  }
  for (const { id, data } of workProjects) {
    node(careerKey.work(id));
    for (const roleId of data.roles) link(careerKey.work(id), careerKey.role(roleId));
  }
  return new Map([...links].map(([key, set]) => [key, [...set].sort((a, b) => a.localeCompare(b, "en"))]));
}

/** Whole months between two dates, as years to one decimal (Oct 2019 → Mar 2026 is 6.4). */
export function yearsBetween(start: Date, end: Date): number {
  return Math.round((monthsBetween(start, end) / 12) * 10) / 10;
}

/**
 * Throws if any cross-collection ID is broken, if a role and an accomplishment
 * disagree about who owns it, or if a concurrent role has nothing to sit
 * alongside. Called at build time so bad content fails the build instead of
 * rendering a half-linked record.
 */
export function validateCareerGraph(
  roles: readonly RoleLike[],
  accomplishments: readonly AccomplishmentLike[],
  workProjects: readonly WorkProjectLike[] = [],
): void {
  const rolesById = byId(roles);
  const problems = [
    ...roleProblems(roles, byId(accomplishments)),
    ...concurrentRoleProblems(roles),
    ...accomplishmentProblems(accomplishments, rolesById, byId(workProjects)),
    ...workProjectProblems(workProjects, rolesById),
  ];
  if (problems.length > 0) {
    throw new Error(`Career content is inconsistent:\n- ${problems.join("\n- ")}`);
  }
}

/** Each role's accomplishment IDs must exist and point back at that role. */
function roleProblems(
  roles: readonly RoleLike[],
  accomplishmentsById: ReadonlyMap<string, AccomplishmentLike>,
): string[] {
  const problems: string[] = [];
  for (const role of roles) {
    for (const id of role.data.accomplishments) {
      const accomplishment = accomplishmentsById.get(id);
      if (!accomplishment) {
        problems.push(`role "${role.id}" lists missing accomplishment "${id}"`);
      } else if (accomplishment.data.roleId !== role.id) {
        problems.push(
          `role "${role.id}" lists accomplishment "${id}", whose roleId is "${accomplishment.data.roleId}"`,
        );
      }
    }
  }
  return problems;
}

/** A concurrent role must overlap a primary role at the same organization. */
function concurrentRoleProblems(roles: readonly RoleLike[]): string[] {
  const primaries = roles.filter((role) => trackOf(role) === "primary");
  return roles
    .filter((role) => trackOf(role) === "concurrent")
    .filter(
      (role) =>
        !primaries.some(
          (host) => host.data.organization === role.data.organization && overlapMs(host.data, role.data) > 0,
        ),
    )
    .map((role) => `concurrent role "${role.id}" does not overlap a primary role at ${role.data.organization}`);
}

/** Each work project's roles must exist. */
function workProjectProblems(
  workProjects: readonly WorkProjectLike[],
  rolesById: ReadonlyMap<string, RoleLike>,
): string[] {
  return workProjects.flatMap((project) =>
    project.data.roles
      .filter((id) => !rolesById.has(id))
      .map((id) => `work project "${project.id}" lists unknown role "${id}"`),
  );
}

/** Each accomplishment's roleId must exist and list it; related roles and its work project must exist. */
function accomplishmentProblems(
  accomplishments: readonly AccomplishmentLike[],
  rolesById: ReadonlyMap<string, RoleLike>,
  workProjectsById: ReadonlyMap<string, WorkProjectLike>,
): string[] {
  const problems: string[] = [];
  for (const accomplishment of accomplishments) {
    const { roleId, relatedRoles, workProject } = accomplishment.data;
    if (workProject !== undefined && !workProjectsById.has(workProject)) {
      problems.push(`accomplishment "${accomplishment.id}" has unknown work project "${workProject}"`);
    }
    const owner = rolesById.get(roleId);
    if (!owner) {
      problems.push(`accomplishment "${accomplishment.id}" has unknown roleId "${roleId}"`);
    } else if (!owner.data.accomplishments.includes(accomplishment.id)) {
      problems.push(`accomplishment "${accomplishment.id}" is not listed by its role "${roleId}"`);
    }
    for (const related of relatedRoles) {
      if (!rolesById.has(related)) {
        problems.push(`accomplishment "${accomplishment.id}" has unknown related role "${related}"`);
      }
    }
  }
  return problems;
}
