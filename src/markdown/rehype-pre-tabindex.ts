import type { Element, Root } from "hast"
import { visit } from "unist-util-visit"

// Code blocks scroll horizontally on small screens: make them reachable with the keyboard
export default function rehypePreTabindex() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "pre") node.properties.tabIndex = 0
    })
  }
}
