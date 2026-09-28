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
        const files = await collectFiles(contentDir)
        const outDir = fileURLToPath(dir)
        await Promise.all(
          [...files].map(async ([url, file]) => {
            const dest = path.join(outDir, url)
            await mkdir(path.dirname(dest), { recursive: true })
            await copyFile(file, dest)
          })
        )
        logger.info(`Copied ${files.size} linked files`)
      },
    },
  }
}
