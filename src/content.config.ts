import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const accomplishments = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/accomplishments" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    category: z.string(),
    summary: z.string(),
    impact: z.string(),
    technologies: z.array(z.string()).default([]),
    role: z.string(),
    organization: z.string(),
    roleType: z.enum(["primary", "leadership", "initiative"]).default("primary"),
    featured: z.boolean().default(false),
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
      type: z.enum(["none", "wasm", "web", "external"]),
      build_command: z.string().optional(),
      output_directory: z.string().optional(),
      entrypoint: z.string().optional(),
      url: z.url().optional(),
    }),
    featured: z.boolean().default(false),
    status: z.enum(["active", "complete", "experimental", "prototype", "archived"]),
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

export const collections = { accomplishments, projects };
