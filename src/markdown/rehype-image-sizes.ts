import type { Element, Root } from "hast"
import { visit } from "unist-util-visit"

// Post images never display wider than 800px (the prose column), whatever their source size
const SINGLE_SIZES = "(max-width: 800px) 100vw, 800px"
// Paragraphs with several images are laid out as a row (globals.css): ask for thumbnail-sized sources
const ROW_SIZES = "(max-width: 640px) 100vw, 380px"

const isImage = (node: unknown): node is Element =>
  (node as Element).type === "element" && (node as Element).tagName === "img"

/** Sets `sizes` on Markdown images; Astro then passes it to the optimized <img> it renders */
export default function rehypeImageSizes() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "p") {
        const images = node.children.filter(isImage)
        if (images.length < 2) return
        for (const img of images) img.properties.sizes ??= ROW_SIZES
      } else if (node.tagName === "img") {
        node.properties.sizes ??= SINGLE_SIZES
      }
    })
  }
}
