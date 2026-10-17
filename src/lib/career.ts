// Pure helpers for the roles and accomplishments collections. They take the
// minimal shape they need so tests can pass plain objects instead of Astro
// collection entries.

export interface RoleLike {
  id: string;
  data: {
    title: string;
    organization: string;
    startDate: Date;
    endDate?: Date;
    order: number;
    accomplishments: string[];
  };
}

export interface AccomplishmentLike {
  id: string;
  data: {
    date: Date;
    category: string;
    roleId: string;
    relatedRoles: string[];
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

export function uniqueSorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort();
}

export function roleCategories(
  role: RoleLike,
  accomplishmentsById: ReadonlyMap<string, AccomplishmentLike>,
): string[] {
  return uniqueSorted(accomplishmentsForRole(role, accomplishmentsById).map((a) => a.data.category));
}

/**
 * Throws if any cross-collection ID is broken or if a role and an
 * accomplishment disagree about who owns it. Called at build time so bad
 * content fails the build instead of rendering a half-linked timeline.
 */
export function validateCareerGraph(
  roles: readonly RoleLike[],
  accomplishments: readonly AccomplishmentLike[],
): void {
  const roleIds = new Set(roles.map((role) => role.id));
  const accomplishmentsById = byId(accomplishments);
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

  for (const accomplishment of accomplishments) {
    const { roleId, relatedRoles } = accomplishment.data;
    if (!roleIds.has(roleId)) {
      problems.push(`accomplishment "${accomplishment.id}" has unknown roleId "${roleId}"`);
    } else if (!roles.find((role) => role.id === roleId)?.data.accomplishments.includes(accomplishment.id)) {
      problems.push(`accomplishment "${accomplishment.id}" is not listed by its role "${roleId}"`);
    }
    for (const related of relatedRoles) {
      if (!roleIds.has(related)) {
        problems.push(`accomplishment "${accomplishment.id}" has unknown related role "${related}"`);
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(`Career content is inconsistent:\n- ${problems.join("\n- ")}`);
  }
}
