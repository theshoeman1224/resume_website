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

export const collections = { accomplishments };
