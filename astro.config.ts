import { copyFile } from "node:fs/promises"
import { globSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "astro/config"
import type { AstroIntegration } from "astro"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"
import { parseFrontmatter, rehypeHeadingIds, unified } from "@astrojs/markdown-remark"
import type { Element } from "hast"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"
import { linkedFiles, remarkLinkedFiles } from "./src/markdown/linked-files"
import rehypeImageLayout from "./src/markdown/rehype-image-layout"
import rehypePreTabindex from "./src/markdown/rehype-pre-tabindex"
import remarkChart from "./src/markdown/remark-chart"
import remarkMermaid from "./src/markdown/remark-mermaid"
import { LANGUAGES, localizedPath } from "./src/lib/i18n"
import { SITE_URL } from "./src/lib/site"

const contentDir = fileURLToPath(new URL("./content", import.meta.url))

// Link icon of the heading anchors (the one gatsby-remark-autolink-headers used)
const anchorIcon: Element = {
  type: "element",
  tagName: "svg",
  properties: { ariaHidden: "true", focusable: "false", height: 16, width: 16, viewBox: "0 0 16 16" },
  children: [
    {
      type: "element",
      tagName: "path",
      properties: {
        fillRule: "evenodd",
        d: "M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z",
      },
      children: [],
    },
  ],
}

const isoDate = (value: unknown) => (value instanceof Date ? value.toISOString().slice(0, 10) : String(value))

// Post URL → <lastmod> for the sitemap (front matter lastmod, else date). Read from the files directly:
// content collections are not available while the config loads.
const postLastmod = new Map(
  globSync("posts/*/index.*.md", { cwd: contentDir }).map((file) => {
    const { frontmatter } = parseFrontmatter(readFileSync(path.join(contentDir, file), "utf8"))
    const url = `${SITE_URL}${localizedPath(`/post/${frontmatter.slug}/`, frontmatter.lang)}`
    return [url, isoDate(frontmatter.lastmod ?? frontmatter.date)]
  })
)

// Pages kept out of the sitemap: search results, 404s and the redirects (Hugo /posts/ URLs, the former "Projects"
// category, /projects/<slug>/ to a project's overview). Anchored after the optional language prefix so a tag or
// post slug named "search", "404" or "posts" stays in; the /projects/ list itself stays in.
const SITEMAP_EXCLUDED = new RegExp(
  `^(/(${LANGUAGES.join("|")}))?/(search|404|posts|category/projects|projects/[^/]+)(/|$)`
)

// Search engines do not follow meta refresh: serve the Hugo sitemap URL as a copy. Must come after sitemap().
const legacySitemap: AstroIntegration = {
  name: "legacy-sitemap",
  hooks: {
    "astro:build:done": async ({ dir }) => {
      const outDir = fileURLToPath(dir)
      await copyFile(path.join(outDir, "sitemap-index.xml"), path.join(outDir, "sitemap.xml"))
    },
  },
}

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [
    react(),
    linkedFiles(contentDir),
    sitemap({
      filter: (page) => !SITEMAP_EXCLUDED.test(new URL(page).pathname),
      serialize: (item) => {
        const lastmod = postLastmod.get(item.url)
        return lastmod ? { ...item, lastmod } : item
      },
    }),
    legacySitemap,
  ],
  image: {
    // Markdown images get a srcset instead of a single full-size file
    layout: "constrained",
  },
  markdown: {
    syntaxHighlight: { type: "prism", excludeLangs: ["mermaid", "chart", "math"] },
    processor: unified({
      // Straight quotes and dots are kept as written, like the Gatsby build did
      smartypants: false,
      // remarkMermaid and remarkChart must run before Prism: they take their fences out of the code blocks
      remarkPlugins: [remarkMermaid, [remarkChart, { contentDir }], remarkMath, [remarkLinkedFiles, { contentDir }]],
      rehypePlugins: [
        [rehypeKatex, { strict: "ignore" }],
        rehypePreTabindex,
        rehypeImageLayout,
        // Ids first so the anchors have something to point at; headings get scroll-margin-top in globals.css
        rehypeHeadingIds,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "prepend",
            properties: { className: ["anchor", "before"], ariaHidden: "true", tabIndex: -1 },
            content: anchorIcon,
          },
        ],
      ],
    }),
  },
})
