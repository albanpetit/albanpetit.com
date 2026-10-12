// Renders every ```mermaid fence of the posts and pages to src/diagrams/<id>.svg, which remark-mermaid inlines at
// build time: readers get a plain SVG instead of ~600 KB of mermaid.js. Run `npm run diagrams` after adding or
// editing a diagram, and commit the SVGs. Needs a Chromium for Playwright (`npx playwright install chromium`), or
// one given by CHROMIUM_PATH.
//
// Mermaid's themes bake colors into each SVG. To follow the site's light and dark themes instead, the diagram is
// drawn with placeholder colors that are then swapped for the site's CSS variables (the approach of the hand-drawn
// diagram in the avahi-caddy-local-names post). Text is measured with DejaVu Sans, wider than the system fonts
// it is shown with, so labels never overflow their boxes.
import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"
import { DIAGRAMS_DIR, diagramId } from "../src/markdown/diagrams.ts"

const ROOT = fileURLToPath(new URL("../", import.meta.url))
const CONTENT_DIRS = ["content/posts", "content/pages"]
const MEASURE_FONT = "DejaVu Sans"

// Placeholder color → site CSS variable. Placeholders are unlikely colors, each mapped to one role
const COLORS: Record<string, string> = {
  "#0a0b01": "hsl(var(--card))", // diagram background, edge labels
  "#0a0b02": "hsl(var(--muted))", // node fill
  "#0a0b03": "hsl(var(--foreground))", // text
  "#0a0b04": "hsl(var(--muted-foreground))", // node borders
  "#0a0b05": "hsl(var(--muted-foreground))", // lines and arrows
  "#0a0b06": "hsl(var(--background))", // groups (subgraphs)
  "#0a0b07": "hsl(var(--accent))", // notes
  // Timeline sections, one color each as in mermaid's own themes (--diagram-1 to 6 in globals.css)
  ...Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`#0a0c0${i + 1}`, `hsl(var(--diagram-${i + 1}))`])),
}
const [BACKGROUND, NODE, TEXT, BORDER, LINE, GROUP, NOTE] = Object.keys(COLORS)
const timelineScale = Object.fromEntries(
  Array.from({ length: 12 }, (_, i) => [
    [`cScale${i}`, `#0a0c0${(i % 6) + 1}`],
    [`cScaleLabel${i}`, TEXT],
    [`cScalePeer${i}`, BORDER],
    [`cScaleInv${i}`, BORDER],
  ]).flat()
)

const THEME = {
  startOnLoad: false,
  theme: "base",
  // SVG text rather than HTML in <foreignObject>: no clipping when the reader's font is wider than expected
  htmlLabels: false,
  flowchart: { htmlLabels: false, wrappingWidth: 1000 },
  // Line breaks come from the <br/> in the labels only, as when mermaid.js rendered them with HTML labels
  markdownAutoWrap: false,
  // Fixed seed for the rounded shapes: rendering the same source again gives the same SVG
  handDrawnSeed: 1,
  fontFamily: MEASURE_FONT,
  themeVariables: {
    fontFamily: MEASURE_FONT,
    darkMode: false,
    background: BACKGROUND,
    mainBkg: NODE,
    primaryColor: NODE,
    primaryTextColor: TEXT,
    primaryBorderColor: BORDER,
    secondaryColor: NODE,
    secondaryTextColor: TEXT,
    secondaryBorderColor: BORDER,
    tertiaryColor: GROUP,
    tertiaryTextColor: TEXT,
    tertiaryBorderColor: BORDER,
    textColor: TEXT,
    titleColor: TEXT,
    nodeBorder: BORDER,
    nodeTextColor: TEXT,
    lineColor: LINE,
    edgeLabelBackground: BACKGROUND,
    clusterBkg: GROUP,
    clusterBorder: BORDER,
    actorBkg: NODE,
    actorBorder: BORDER,
    actorTextColor: TEXT,
    actorLineColor: LINE,
    signalColor: LINE,
    signalTextColor: TEXT,
    labelBoxBkgColor: NODE,
    labelBoxBorderColor: BORDER,
    labelTextColor: TEXT,
    loopTextColor: TEXT,
    noteBkgColor: NOTE,
    noteBorderColor: BORDER,
    noteTextColor: TEXT,
    activationBkgColor: NOTE,
    activationBorderColor: BORDER,
    sequenceNumberColor: BACKGROUND,
    ...timelineScale,
  },
}

/** The ```mermaid fences of every Markdown file in the content directories, as remark sees them */
function collectSources() {
  const sources = new Map<string, string>()
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (entry.name.endsWith(".md")) {
        for (const match of readFileSync(path, "utf8").matchAll(/^```mermaid[^\n]*\n([\s\S]*?)\n?^```/gm)) {
          sources.set(diagramId(match[1]), match[1])
        }
      }
    }
  }
  for (const dir of CONTENT_DIRS) walk(join(ROOT, dir))
  return sources
}

/** Swaps placeholder colors (hex, or rgb() once the browser has normalized a rule) for the site variables */
function themeColors(svg: string) {
  let result = svg
  for (const [hex, variable] of Object.entries(COLORS)) {
    const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16))
    result = result
      .replaceAll(new RegExp(hex, "gi"), variable)
      .replaceAll(new RegExp(`rgb\\(${r},\\s*${g},\\s*${b}\\)`, "g"), variable)
  }
  return (
    result
      .replace(/font-family:\s*(?:"DejaVu Sans"|DejaVu Sans)/g, "font-family: inherit")
      // Coordinates to 2 decimals: a hundredth of a pixel is invisible, and the rounded shapes get much lighter
      .replace(/(?<![\d.])(\d+\.\d{2})\d+/g, "$1")
  )
}

const sources = collectSources()
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
const page = await browser.newPage()
await page.setContent(`<!doctype html><html><body style="font-family: '${MEASURE_FONT}'"></body></html>`)
await page.addScriptTag({ path: join(ROOT, "node_modules/mermaid/dist/mermaid.min.js") })

const rendered = await page.evaluate(
  async ({ config, diagrams }) => {
    // biome-ignore lint/suspicious/noExplicitAny: mermaid is a global of the page
    const mermaid = (window as any).mermaid
    mermaid.initialize(config)
    const results: [string, string][] = []
    for (const [id, source] of diagrams) {
      const { svg: markup } = await mermaid.render(id, source)
      const host = document.createElement("div")
      host.innerHTML = markup
      document.body.append(host)
      const svg = host.querySelector("svg") as SVGSVGElement
      const style = svg.querySelector("style") as HTMLStyleElement
      // Layout data only mermaid's own scripts read; removed first so the rules that target it are dropped below
      for (const element of Array.from(svg.querySelectorAll("*"))) {
        for (const attribute of Array.from(element.attributes)) {
          if (attribute.name.startsWith("data-") || (attribute.name === "style" && !attribute.value)) {
            element.removeAttribute(attribute.name)
          }
        }
      }

      // Keep only the rules (and selectors) that match something: mermaid ships the stylesheet of every diagram type
      const rules = new Set<string>()
      for (const rule of Array.from(style.sheet?.cssRules ?? [])) {
        if (!(rule instanceof CSSStyleRule)) continue
        const selectors = rule.selectorText.split(",").map((selector) => selector.trim())
        const used = selectors.filter((selector) => selector === `#${id}` || svg.querySelector(selector) !== null)
        // The timeline brightens its events, which turns light-theme boxes white on white
        if (rule.style.filter.startsWith("brightness")) continue
        if (used.length > 0) rules.add(`${used.join(",")}{${rule.style.cssText}}`)
      }
      style.textContent = [...rules].join("")

      // Drop the near-invisible drop shadows (their color is baked in), then the arrowheads, icons and filters
      // nothing references, which mermaid adds to every diagram
      for (const element of Array.from(svg.querySelectorAll("[filter]"))) element.removeAttribute("filter")
      const references = svg.outerHTML
      for (const definition of Array.from(svg.querySelectorAll("marker, symbol, filter"))) {
        if (!references.includes(`url(#${definition.id})`) && !references.includes(`href="#${definition.id}"`)) {
          definition.remove()
        }
      }
      for (const defs of Array.from(svg.querySelectorAll("defs"))) {
        if (defs.childElementCount === 0) defs.remove()
      }
      for (const group of Array.from(svg.querySelectorAll("g"))) {
        if (group.childElementCount === 0 && !group.textContent?.trim()) group.remove()
      }
      results.push([id, svg.outerHTML])
      host.remove()
    }
    return results
  },
  { config: THEME, diagrams: [...sources] }
)
await browser.close()

const existing = new Set(readdirSync(DIAGRAMS_DIR).filter((name) => name.endsWith(".svg")))
for (const [id, svg] of rendered) {
  writeFileSync(join(DIAGRAMS_DIR, `${id}.svg`), `${themeColors(svg)}\n`)
  existing.delete(`${id}.svg`)
}
for (const orphan of existing) rmSync(join(DIAGRAMS_DIR, orphan))

const leftover = rendered.flatMap(([id, svg]) =>
  (themeColors(svg).match(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\((?!var)[^)]*\)/gi) ?? []).map((c) => `${id}: ${c}`)
)
console.log(`${rendered.length} diagrams rendered, ${existing.size} stale SVGs removed`)
if (leftover.length > 0) console.warn(`Colors not mapped to a site variable:\n${[...new Set(leftover)].join("\n")}`)
