import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

// Translations of a post share their slug: ids come from the file path (e.g. "paperflux/index.fr")
// instead of the front matter slug, which the glob loader would otherwise use and collide on
const idFromPath = ({ entry }: { entry: string }) => entry.replace(/\.md$/, "")

const posts = defineCollection({
  loader: glob({ pattern: "*/index.*.md", base: "./content/posts", generateId: idFromPath }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      lang: z.enum(["en", "fr"]),
      date: z.coerce.date(),
      lastmod: z.coerce.date().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).default([]),
      // English name in both languages: it drives the slug, src/lib/category.ts translates the label
      category: z.string().optional(),
      image: image().optional(),
    }),
})

const pages = defineCollection({
  loader: glob({ pattern: "*.md", base: "./content/pages", generateId: idFromPath }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    lang: z.enum(["en", "fr"]),
  }),
})

// A project gathers the daily logs written while working on it, until its final post is published
const projects = defineCollection({
  loader: glob({ pattern: "*/index.*.md", base: "./content/projects", generateId: idFromPath }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      lang: z.enum(["en", "fr"]),
      description: z.string(),
      status: z.enum(["in-progress", "paused", "done"]).default("in-progress"),
      started: z.coerce.date(),
      // Slug of the final post, once written: the project page links to it and the post back to the logs
      post: z.string().optional(),
      image: image().optional(),
    }),
})

// One file per day and language, content/logs/<YYYY-MM-DD>/index.<lang>.md: the folder name is the date and
// the URL, and holds the day's images and CSV files
const logs = defineCollection({
  loader: glob({ pattern: "*/index.*.md", base: "./content/logs", generateId: idFromPath }),
  schema: z.object({
    // Optional: the date alone makes a fine title for a daily log
    title: z.string().optional(),
    lang: z.enum(["en", "fr"]),
    // Slugs of the projects this day's work was about (content/projects/<slug>/)
    projects: z.array(z.string()).min(1),
  }),
})

export const collections = { posts, pages, projects, logs }
