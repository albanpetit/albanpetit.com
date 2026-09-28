import { createHash } from "node:crypto"
import { copyFile, mkdir, readdir, readFile } from "node:fs/promises"
import { existsSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { AstroIntegration } from "astro"
import type { Link, Root } from "mdast"
import type { VFile } from "vfile"
import { visit } from "unist-util-visit"

// Images are optimized by Astro itself; Markdown files are posts, not downloads
const SKIPPED_EXTENSIONS = /\.(md|png|jpe?g|webp|gif|bmp|tiff|avif|svg)$/i

const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".stl": "model/stl",
  ".3mf": "model/3mf",
}

/**
 * Public URL of a file linked from Markdown (PDF datasheets…). Same scheme as gatsby-remark-copy-linked-files:
 * the md5 of the file keeps URLs stable across builds and busts caches when the file changes.
 */
const publicUrl = (file: string, content: Buffer) =>
  `/static/${createHash("md5").update(content).digest("hex")}/${path.basename(file)}`

const isRelative = (url: string) => !/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(url)

/** Rewrites relative links to non-image files so they point to the copies made by the `linkedFiles` integration */
export function remarkLinkedFiles() {
  return (tree: Root, file: VFile) => {
    if (!file.path) return
    const dir = path.dirname(file.path)
    visit(tree, "link", (node: Link) => {
      if (!isRelative(node.url)) return
      const target = path.resolve(dir, decodeURIComponent(node.url.split(/[?#]/)[0]))
      if (SKIPPED_EXTENSIONS.test(target) || !existsSync(target) || !statSync(target).isFile()) return
      node.url = publicUrl(target, readFileSync(target))
    })
  }
}

async function listFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true })
  return entries
    .filter((entry) => entry.isFile() && !entry.name.startsWith(".") && !SKIPPED_EXTENSIONS.test(entry.name))
    .map((entry) => path.join(entry.parentPath, entry.name))
}

/** url → absolute path of every linkable file under `contentDir` */
async function collectFiles(contentDir: string) {
  const files = new Map<string, string>()
  for (const file of await listFiles(contentDir)) files.set(publicUrl(file, await readFile(file)), file)
  return files
}

// /static/ URLs in the generated pages and feeds (feeds use absolute URLs, hence no leading anchor)
const STATIC_URL_PATTERN = /\/static\/[0-9a-f]{32}\/[^"'\s<>)]+/g

const safeDecode = (url: string) => {
  try {
    return decodeURIComponent(url)
  } catch {
    return url
  }
}

/** /static/ URLs referenced by the HTML pages and XML feeds of the build output */
async function referencedUrls(outDir: string) {
  const entries = await readdir(outDir, { withFileTypes: true, recursive: true })
  const urls = new Set<string>()
  for (const entry of entries) {
    if (!entry.isFile() || !/\.(html|xml)$/.test(entry.name)) continue
    const content = await readFile(path.join(entry.parentPath, entry.name), "utf8")
    for (const [url] of content.matchAll(STATIC_URL_PATTERN)) urls.add(safeDecode(url))
  }
  return urls
}

/** Serves linked files in dev and copies them to the build output */
export function linkedFiles(contentDir: string): AstroIntegration {
  return {
    name: "linked-files",
    hooks: {
      "astro:server:setup": ({ server }) => {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith("/static/")) return next()
          const file = (await collectFiles(contentDir)).get(decodeURIComponent(req.url.split("?")[0]))
          if (!file) return next()
          res.setHeader("Content-Type", MIME_TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream")
          res.end(await readFile(file))
        })
      },
      "astro:build:done": async ({ dir, logger }) => {
        // Only files a page actually links to are published, like gatsby-remark-copy-linked-files did:
        // drafts or sources lying next to a post stay private
        const outDir = fileURLToPath(dir)
        const referenced = await referencedUrls(outDir)
        const files = [...(await collectFiles(contentDir))].filter(([url]) => referenced.has(url))
        await Promise.all(
          files.map(async ([url, file]) => {
            const dest = path.join(outDir, url)
            await mkdir(path.dirname(dest), { recursive: true })
            await copyFile(file, dest)
          })
        )
        logger.info(`Copied ${files.length} linked files`)
      },
    },
  }
}
