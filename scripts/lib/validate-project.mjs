// Validation for a repository's .portfolio/project.yaml (schema_version 1).
// Kept separate from the sync script so it can be unit-tested.
import { PROJECT_DEMO_TYPES, PROJECT_STATUSES } from "../../src/lib/project-vocabulary.js";

const allowedStatuses = new Set(PROJECT_STATUSES);
const allowedDemoTypes = new Set(PROJECT_DEMO_TYPES);

export function validateProject(document, repository) {
  if (document?.schema_version !== 1 || !document.project || typeof document.project !== "object") {
    throw new Error(`${repository}: expected schema_version 1 and a project object`);
  }
  const project = document.project;
  for (const field of ["name", "slug", "tagline", "summary", "description", "status", "role"]) {
    if (typeof project[field] !== "string" || project[field].trim() === "") {
      throw new Error(`${repository}: project.${field} must be a non-empty string`);
    }
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) {
    throw new Error(`${repository}: project.slug is not URL-safe`);
  }
  if (!allowedStatuses.has(project.status)) {
    throw new Error(`${repository}: unsupported project.status ${project.status}`);
  }
  validateStringArray(project.technologies, repository, "technologies", 1);
  validateStringArray(project.categories, repository, "categories", 1);
  validateStringArray(project.highlights, repository, "highlights", 3, 6);

  if (!project.links || typeof project.links.repository !== "string") {
    throw new Error(`${repository}: project.links.repository is required`);
  }
  validatePublicUrl(project.links.repository, repository, "links.repository");
  const primary = validateLinks(project.links.primary ?? [], repository, "links.primary");
  const dashboards = validateLinks(project.links.dashboards ?? [], repository, "links.dashboards");

  if (!project.demo || !allowedDemoTypes.has(project.demo.type)) {
    throw new Error(`${repository}: project.demo.type is invalid`);
  }
  if (project.demo.type === "wasm") {
    requireString(project.demo.build_command, repository, "demo.build_command");
    requireString(project.demo.output_directory, repository, "demo.output_directory");
  } else if (project.demo.type === "web") {
    requireString(project.demo.entrypoint, repository, "demo.entrypoint");
  } else if (project.demo.type === "external") {
    validatePublicUrl(project.demo.url, repository, "demo.url");
  }

  return {
    name: project.name.trim(),
    slug: project.slug,
    tagline: project.tagline.trim(),
    summary: project.summary.trim(),
    description: project.description.trim(),
    status: project.status,
    role: project.role.trim(),
    dates: {
      started: normalizeDate(project.dates?.started),
      completed: normalizeDate(project.dates?.completed),
    },
    technologies: project.technologies,
    categories: project.categories,
    highlights: project.highlights,
    links: {
      repository: project.links.repository,
      primary,
      dashboards,
    },
    media: project.media,
    demo: project.demo,
  };
}

function validateStringArray(value, repository, field, minimum, maximum = Infinity) {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new Error(`${repository}: project.${field} must contain ${minimum}-${maximum === Infinity ? "many" : maximum} non-empty strings`);
  }
}

function validateLinks(value, repository, field) {
  if (!Array.isArray(value)) throw new Error(`${repository}: project.${field} must be an array`);
  return value.map((link, index) => {
    requireString(link?.name, repository, `${field}[${index}].name`);
    requireString(link?.type, repository, `${field}[${index}].type`);
    validatePublicUrl(link?.url, repository, `${field}[${index}].url`);
    return { name: link.name, type: link.type, url: link.url };
  });
}

function validatePublicUrl(value, repository, field) {
  requireString(value, repository, field);
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error(`${repository}: ${field} must use HTTPS`);
}

function requireString(value, repository, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${repository}: ${field} must be a non-empty string`);
  }
}

function normalizeDate(value) {
  if (value === null || value === undefined || value === "") return undefined;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}
