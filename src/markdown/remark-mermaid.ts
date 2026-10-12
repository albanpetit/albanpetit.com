import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import type { Code, Html, Root } from "mdast"
import { visit } from "unist-util-visit"
import { DIAGRAMS_DIR, diagramId } from "./diagrams"

// Replaces ```mermaid code fences with the SVG pre-rendered by scripts/render-diagrams.ts (`npm run diagrams`),
// so readers download no diagram JavaScript. The SVG takes its colors from the site's CSS variables and follows
// the light and dark themes. Runs as a remark plugin, before Prism highlights code blocks.
export default function remarkMermaid() {
  return (tree: Root) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if (node.lang !== "mermaid" || !parent || index === undefined) return
      const id = diagramId(node.value)
      const file = join(DIAGRAMS_DIR, `${id}.svg`)
      if (!existsSync(file)) {
        throw new Error(`Mermaid diagram ${id} has no SVG yet: run \`npm run diagrams\`\n${node.value}`)
      }
      const html: Html = { type: "html", value: `<figure class="diagram">${readFileSync(file, "utf8")}</figure>` }
      parent.children[index] = html
    })
  }
}
