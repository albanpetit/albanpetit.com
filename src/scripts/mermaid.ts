import { currentTheme, onThemeChange, type Theme } from "@/scripts/theme"

const MERMAID_CDN_URL = "https://cdn.jsdelivr.net/npm/mermaid@12/dist/mermaid.esm.min.mjs"

// The original source is stashed on each element before mermaid.js replaces its content with
// rendered SVG, so a theme change can restore it and re-run the render from scratch
// (mermaid has no supported way to re-theme an already-rendered diagram in place).
const elements = Array.from(document.querySelectorAll<HTMLElement>("pre.mermaid"))
let latestRender = 0
// Renders run one after the other: resetting the elements while mermaid.run is still writing
// would let that older run overwrite the new theme with its SVG
let queue = Promise.resolve()

function renderDiagrams(theme: Theme) {
  const render = ++latestRender
  queue = queue
    .then(async () => {
      const { default: mermaid } = await import(/* @vite-ignore */ MERMAID_CDN_URL)
      // A newer theme change came in meanwhile: let that one render
      if (render !== latestRender) return
      for (const el of elements) {
        if (el.dataset.mermaidSource === undefined) el.dataset.mermaidSource = el.textContent ?? ""
        el.removeAttribute("data-processed")
        el.textContent = el.dataset.mermaidSource ?? ""
      }
      mermaid.initialize({ startOnLoad: false, theme: theme === "dark" ? "dark" : "default" })
      await mermaid.run({ nodes: elements })
    })
    .catch((error) => console.error("Mermaid render failed", error))
}

if (elements.length > 0) {
  renderDiagrams(currentTheme())
  onThemeChange(renderDiagrams)
}
