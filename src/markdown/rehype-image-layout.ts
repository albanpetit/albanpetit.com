import path from "node:path"
import type { Element, ElementContent, Root } from "hast"
import sharp from "sharp"
import type { VFile } from "vfile"
import { visit } from "unist-util-visit"

// Post images never display wider than 800px (the prose column), whatever their source size
const COLUMN_WIDTH = 800
// Images per row in a group: 4 images give 2 rows of 2, 5 give 3 + 2…
const MAX_PER_ROW = 3

const isImage = (node: ElementContent): node is Element => node.type === "element" && node.tagName === "img"
const isBlank = (node: ElementContent) => node.type === "text" && node.value.trim() === ""

/** Width / height of a local image, as displayed (EXIF rotation applied); undefined when it cannot be read */
async function aspectRatio(img: Element, file: VFile) {
  const src = String(img.properties.src ?? "")
  if (!file.path || /^([a-z][a-z0-9+.-]*:|\/)/i.test(src)) return undefined
  try {
    const metadata = await sharp(path.resolve(path.dirname(file.path), decodeURI(src))).metadata()
    const { width, height } = metadata.autoOrient ?? metadata
    return width && height ? width / height : undefined
  } catch {
    return undefined
  }
}

/** Splits `count` images into rows of at most MAX_PER_ROW, as even as possible: 4 → [2, 2], 5 → [3, 2] */
function rowSizes(count: number) {
  const rows = Math.ceil(count / MAX_PER_ROW)
  return Array.from({ length: rows }, (_, i) => Math.floor(count / rows) + (i < count % rows ? 1 : 0))
}

/**
 * Lays out Markdown images, together with the .prose rules in globals.css:
 * - an image alone in its paragraph spans the whole column;
 * - consecutive images (one paragraph) become rows where each image is as wide as its aspect ratio asks
 *   (flex-grow = width / height), so every image of a row gets the same height: no crop, no distortion.
 * Also sets `sizes`, which Astro passes to the optimized <img> it renders.
 */
export default function rehypeImageLayout() {
  return async (tree: Root, file: VFile) => {
    const paragraphs: Element[] = []
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "p" && node.children.some(isImage)) paragraphs.push(node)
    })

    for (const p of paragraphs) {
      const images = p.children.filter(isImage)
      // Images mixed with text stay inline, as written
      if (!p.children.every((child) => isImage(child) || isBlank(child))) {
        for (const img of images) img.properties.sizes ??= `(max-width: ${COLUMN_WIDTH}px) 100vw, ${COLUMN_WIDTH}px`
        continue
      }

      if (images.length === 1) {
        images[0].properties.className = ["media-single"]
        images[0].properties.sizes ??= `(max-width: ${COLUMN_WIDTH}px) 100vw, ${COLUMN_WIDTH}px`
        continue
      }

      const ratios = await Promise.all(images.map((img) => aspectRatio(img, file)))
      const rows: Element[] = []
      let start = 0
      for (const size of rowSizes(images.length)) {
        const rowImages = images.slice(start, start + size)
        const rowRatios = ratios.slice(start, start + size).map((ratio) => ratio ?? 1)
        const total = rowRatios.reduce((sum, ratio) => sum + ratio, 0)
        rowImages.forEach((img, i) => {
          img.properties.style = `--ratio: ${rowRatios[i].toFixed(4)}`
          // Stacked full width on phones (globals.css), its share of the column above
          img.properties.sizes ??= `(max-width: 640px) 100vw, ${Math.round((COLUMN_WIDTH * rowRatios[i]) / total)}px`
        })
        rows.push({
          type: "element",
          tagName: "div",
          properties: { className: ["media-grid-row"] },
          children: rowImages,
        })
        start += size
      }

      // The paragraph becomes the grid: same place in the tree, so the images keep their position in the text
      p.tagName = "div"
      p.properties = { className: ["media-grid"] }
      p.children = rows
    }
  }
}
