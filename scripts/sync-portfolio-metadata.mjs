import { execFileSync } from "node:child_process";
import { access, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cacheRoot = resolve(repositoryRoot, ".portfolio-cache");
const projectOutput = resolve(cacheRoot, "projects");
const mediaOutput = resolve(repositoryRoot, "public/generated/portfolio");
const allowedStatuses = new Set(["active", "complete", "experimental", "prototype", "archived"]);
const allowedDemoTypes = new Set(["none", "wasm", "web", "external"]);
const githubHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "resume-website-portfolio-sync",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

const sourceConfig = JSON.parse(await readFile(resolve(repositoryRoot, "portfolio.sources.json"), "utf8"));
if (!Array.isArray(sourceConfig.sources) || sourceConfig.sources.length === 0) {
  throw new Error("portfolio.sources.json must contain at least one source");
}

await rm(cacheRoot, { recursive: true, force: true });
await rm(mediaOutput, { recursive: true, force: true });
await mkdir(projectOutput, { recursive: true });

const repositories = {};
const slugs = new Set();

for (const source of sourceConfig.sources) {
  const context = await loadSource(source);
  const parsed = parse(context.yaml);
  const project = validateProject(parsed, source.repository);

  if (slugs.has(project.slug)) {
    throw new Error(`Duplicate portfolio slug: ${project.slug}`);
  }
  slugs.add(project.slug);

  if (project.links.repository !== `https://github.com/${source.repository}`) {
    throw new Error(`${source.repository}: links.repository must match the allowlisted repository`);
  }

  const normalized = {
    ...project,
    featured: source.featured === true,
    demoAdapter: source.demoAdapter,
    source: {
      repository: source.repository,
      revision: context.revision,
      defaultBranch: context.defaultBranch,
    },
  };

  if (project.media?.preview) {
    normalized.image = await copyPreview(source, context, project);
  }

  await writeFile(
    resolve(projectOutput, `${project.slug}.json`),
    `${JSON.stringify(normalized, null, 2)}\n`,
  );
  repositories[source.repository] = {
    revision: context.revision,
    defaultBranch: context.defaultBranch,
  };
}

await writeFile(
  resolve(cacheRoot, "repositories.json"),
  `${JSON.stringify({ repositories }, null, 2)}\n`,
);
console.log(`Synchronized ${slugs.size} portfolio projects.`);

async function loadSource(source) {
  assertRepository(source.repository);

  if (source.local) {
    const metadataPath = resolve(repositoryRoot, ".portfolio/project.yaml");
    await access(metadataPath);
    return {
      yaml: await readFile(metadataPath, "utf8"),
      revision: process.env.GITHUB_SHA ?? execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: repositoryRoot,
        encoding: "utf8",
      }).trim(),
      defaultBranch: "local",
      local: true,
    };
  }

  const repository = await fetchJson(`https://api.github.com/repos/${source.repository}`);
  const defaultBranch = repository.default_branch;
  const commit = await fetchJson(
    `https://api.github.com/repos/${source.repository}/commits/${encodeURIComponent(defaultBranch)}`,
  );
  const revision = commit.sha;
  const yaml = await fetchText(githubContentUrl(source.repository, ".portfolio/project.yaml", revision));
  return { yaml, revision, defaultBranch, local: false };
}

async function copyPreview(source, context, project) {
  const previewPath = project.media.preview;
  if (!previewPath.startsWith(".portfolio/") || previewPath.includes("..")) {
    throw new Error(`${source.repository}: media.preview must be a safe .portfolio path`);
  }
  if (extname(previewPath).toLowerCase() !== ".png") {
    throw new Error(`${source.repository}: media.preview must be a PNG file`);
  }

  const destinationDirectory = resolve(mediaOutput, project.slug);
  const destination = resolve(destinationDirectory, "preview.png");
  await mkdir(destinationDirectory, { recursive: true });

  if (context.local) {
    const localPreview = resolve(repositoryRoot, previewPath);
    if (!localPreview.startsWith(`${repositoryRoot}${sep}`)) {
      throw new Error(`${source.repository}: media.preview escapes the repository`);
    }
    await copyFile(localPreview, destination);
  } else {
    const response = await fetch(githubContentUrl(source.repository, previewPath, context.revision), {
      headers: { ...githubHeaders, Accept: "application/vnd.github.raw+json" },
    });
    if (!response.ok) {
      throw new Error(`${source.repository}: preview fetch failed with HTTP ${response.status}`);
    }
    await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  }

  return {
    src: `/generated/portfolio/${project.slug}/preview.png`,
    alt: `${project.name} project preview`,
  };
}

function validateProject(document, repository) {
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

function assertRepository(repository) {
  if (typeof repository !== "string" || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error(`Invalid allowlisted repository: ${repository}`);
  }
}

function githubContentUrl(repository, path, revision) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `https://api.github.com/repos/${repository}/contents/${encodedPath}?ref=${encodeURIComponent(revision)}`;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: githubHeaders });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { ...githubHeaders, Accept: "application/vnd.github.raw+json" },
  });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.text();
}
