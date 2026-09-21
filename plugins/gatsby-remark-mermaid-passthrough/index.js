const visit = require("unist-util-visit")

// Only & < > need escaping: the mermaid source sits in HTML text content, not an attribute.
// Escaping (rather than passing the source through raw) matters because some diagrams embed
// literal tags in node labels (e.g. "API GitHub<br/>REST"); left unescaped, remark would emit
// that as a real <br> element and the browser's textContent would then drop it entirely.
const escapeHtml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

// Pulls ```mermaid code fences out of the markdown AST before gatsby-remark-prismjs can tokenize
// them as code, and turns them into a plain-text container that mermaid.js renders client-side
// (see MermaidRenderer in src/templates/post.tsx).
module.exports = ({ markdownAST }) => {
  visit(markdownAST, "code", (node, index, parent) => {
    if (node.lang !== "mermaid") return
    parent.children[index] = {
      type: "html",
      value: `<pre class="mermaid">${escapeHtml(node.value)}</pre>`,
    }
  })
  return markdownAST
}
