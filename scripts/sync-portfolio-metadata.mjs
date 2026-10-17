import { execFileSync } from "node:child_process";
import { access, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { validateProject } from "./lib/validate-project.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cacheRoot = resolve(repositoryRoot, ".portfolio-cache");
const projectOutput = resolve(cacheRoot, "projects");
const mediaOutput = resolve(repositoryRoot, "public/generated/portfolio");
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
      revision: process.env.GITHUB_SHA ?? execFileSync("/usr/bin/git", ["rev-parse", "HEAD"], {
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
