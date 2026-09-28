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

export const collections = { posts, pages }
