import type { Code, Html, Root } from "mdast"
import { visit } from "unist-util-visit"

// Only & < > need escaping: the mermaid source sits in HTML text content, not an attribute.
// Escaping (rather than passing the source through raw) matters because some diagrams embed
// literal tags in node labels (e.g. "API GitHub<br/>REST"); left unescaped, remark would emit
// that as a real <br> element and the browser's textContent would then drop it entirely.
const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

// Turns ```mermaid code fences into a plain-text container that mermaid.js renders client-side
// (see src/scripts/mermaid.ts). Runs as a remark plugin, before Prism highlights code blocks.
export default function remarkMermaid() {
  return (tree: Root) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if (node.lang !== "mermaid" || !parent || index === undefined) return
      const html: Html = { type: "html", value: `<pre class="mermaid" tabindex="0">${escapeHtml(node.value)}</pre>` }
      parent.children[index] = html
    })
  }
}
