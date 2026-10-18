import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { PROJECT_DEMO_TYPES, PROJECT_STATUSES } from "./lib/project-vocabulary.js";

const accomplishments = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/accomplishments" }),
  schema: z.object({
    title: z.string(),
    // Label for the overview chart, where space is tight. Defaults to the title.
    shortTitle: z.string().optional(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    category: z.string(),
    summary: z.string(),
    impact: z.string(),
    technologies: z.array(z.string()).default([]),
    // Cross-collection IDs are checked by validateCareerGraph (src/lib/career.ts).
    roleId: z.string(),
    relatedRoles: z.array(z.string()).default([]),
    workProject: z.string().optional(),
    // Featured wins lead the experience page and the home page's signature work.
    featured: z.boolean().default(false),
    // The headline number, e.g. { value: "7–10% → 1–2%", label: "boot failure rate" }.
    metric: z.object({ value: z.string(), label: z.string() }).optional(),
    // The Markdown body, if any, is the case study (/experience/<id>/).
  }),
});

// Programs or projects at work, drawn as date ranges on the career overview.
// Accomplishments link to a project through their `workProject` field.
const workProjects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work-projects" }),
  schema: z.object({
    title: z.string(),
    // Label for the overview chart, where space is tight. Defaults to the title.
    shortTitle: z.string().optional(),
    organization: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    summary: z.string(),
    roles: z.array(z.string()).default([]),
    technologies: z.array(z.string()).default([]),
  }),
});

const roles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/roles" }),
  schema: z.object({
    title: z.string(),
    // Label for the overview chart, where space is tight. Defaults to the title.
    shortTitle: z.string().optional(),
    organization: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    summary: z.string(),
    focus: z.array(z.string()).default([]),
    accomplishments: z.array(z.string()).default([]),
    order: z.number().default(0),
    // primary: a job title. concurrent: a responsibility held alongside one
    // (shown nested under it). education: a degree.
    track: z.enum(["primary", "concurrent", "education"]).default("primary"),
    // Short scope facts shown under the title, e.g. "Team of 18".
    scope: z.array(z.string()).default([]),
    // True when this title was a promotion from the previous one.
    promotion: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./.portfolio-cache/projects" }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    tagline: z.string(),
    summary: z.string(),
    description: z.string(),
    role: z.string(),
    dates: z.object({
      started: z.string().optional(),
      completed: z.string().optional(),
    }),
    technologies: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    highlights: z.array(z.string()),
    links: z.object({
      repository: z.url(),
      primary: z.array(z.object({
        name: z.string(),
        type: z.string(),
        url: z.url(),
      })),
      dashboards: z.array(z.object({
        name: z.string(),
        type: z.string(),
        url: z.url(),
      })),
    }),
    demo: z.object({
      type: z.enum(PROJECT_DEMO_TYPES),
      build_command: z.string().optional(),
      output_directory: z.string().optional(),
      entrypoint: z.string().optional(),
      url: z.url().optional(),
    }),
    featured: z.boolean().default(false),
    status: z.enum(PROJECT_STATUSES),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }).optional(),
    demoAdapter: z.enum(["snake"]).optional(),
    source: z.object({
      repository: z.string(),
      revision: z.string(),
      defaultBranch: z.string(),
    }),
  }),
});

export const collections = { accomplishments, roles, workProjects, projects };
