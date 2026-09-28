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
      // Name of the project the post belongs to, the same in both languages: it drives the slug (src/lib/projects.ts).
      // A project with several posts gets a page listing them, and each of them a navigation between them
      project: z.string().optional(),
      // The project's overview: it comes first in the project, and its status is the project's
      overview: z.boolean().default(false),
      // Overview only: a project is in progress until its overview says it is done
      status: z.enum(["in-progress", "done"]).optional(),
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

export const collections = { posts, pages }
