import { currentTheme, onThemeChange, type Theme } from "@/scripts/theme"

const MERMAID_CDN_URL = "https://cdn.jsdelivr.net/npm/mermaid@12/dist/mermaid.esm.min.mjs"

// The original source is stashed on each element before mermaid.js replaces its content with
// rendered SVG, so a theme change can restore it and re-run the render from scratch
// (mermaid has no supported way to re-theme an already-rendered diagram in place).
const elements = Array.from(document.querySelectorAll<HTMLElement>("pre.mermaid"))
let latestRender = 0

async function renderDiagrams(theme: Theme) {
  const render = ++latestRender
  for (const el of elements) {
    if (el.dataset.mermaidSource === undefined) el.dataset.mermaidSource = el.textContent ?? ""
    el.removeAttribute("data-processed")
    el.textContent = el.dataset.mermaidSource ?? ""
  }

  const { default: mermaid } = await import(/* @vite-ignore */ MERMAID_CDN_URL)
  // A newer theme change started while the library loaded: let that one render
  if (render !== latestRender) return
  mermaid.initialize({ startOnLoad: false, theme: theme === "dark" ? "dark" : "default" })
  await mermaid.run({ nodes: elements })
}

if (elements.length > 0) {
  renderDiagrams(currentTheme())
  onThemeChange(renderDiagrams)
}
