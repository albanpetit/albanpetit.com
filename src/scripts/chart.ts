import type { Chart as ChartInstance, ChartConfiguration } from "chart.js"
import type { ChartSpec } from "@/markdown/remark-chart"
import { currentTheme, onThemeChange, type Theme } from "@/scripts/theme"

// Draws the ```chart blocks (src/markdown/remark-chart.ts): each figure carries its data as JSON

// Series colors: the site's blue and yellow first, each readable (3:1 or more) on its theme's background
const PALETTE: Record<Theme, string[]> = {
  light: ["#3f72af", "#b7791f", "#c0392b", "#2e8b57", "#7d5ba6", "#138d90"],
  dark: ["#6c9bd8", "#f9dc58", "#e57373", "#66bb6a", "#b39ddb", "#4dd0e1"],
}

const figures = Array.from(document.querySelectorAll<HTMLElement>("figure.chart")).filter((figure) =>
  figure.querySelector("canvas")
)
let charts: ChartInstance[] = []

const cssColor = (variable: string) =>
  `hsl(${getComputedStyle(document.documentElement).getPropertyValue(variable).trim()})`

function configuration(spec: ChartSpec, theme: Theme): ChartConfiguration {
  const colors = PALETTE[theme]
  const text = cssColor("--muted-foreground")
  const grid = cssColor("--border")
  const circular = spec.type === "pie" || spec.type === "doughnut"

  const datasets = spec.datasets.map((dataset, i) => {
    const color = colors[i % colors.length]
    if (circular) {
      const slices = dataset.data.map((_, j) => colors[j % colors.length])
      return { ...dataset, backgroundColor: slices, borderColor: cssColor("--background") }
    }
    const data = spec.type === "scatter" ? dataset.data.map((y, j) => ({ x: Number(spec.labels[j]), y })) : dataset.data
    return { ...dataset, data, borderColor: color, backgroundColor: spec.type === "bar" ? `${color}cc` : color }
  })

  const axis = (title?: string) => ({
    ticks: { color: text },
    grid: { color: grid },
    title: { display: Boolean(title), text: title, color: text },
  })

  return {
    type: spec.type,
    data: { labels: spec.type === "scatter" ? undefined : spec.labels, datasets },
    options: {
      maintainAspectRatio: false,
      locale: document.documentElement.lang,
      animation: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? false : undefined,
      spanGaps: true,
      plugins: { legend: { display: circular || datasets.length > 1, labels: { color: text } } },
      scales: circular
        ? {}
        : { x: { ...axis(spec.xLabel), type: spec.type === "scatter" ? "linear" : undefined }, y: axis(spec.yLabel) },
    },
  } as ChartConfiguration
}

async function drawCharts(theme: Theme) {
  // Dynamic import: its own chunk, downloaded only by the pages that have a chart
  const { default: Chart } = await import("chart.js/auto")
  for (const chart of charts) chart.destroy()
  charts = figures.map((figure) => {
    const spec = JSON.parse(figure.querySelector(".chart-spec")?.textContent ?? "{}") as ChartSpec
    return new Chart(figure.querySelector("canvas") as HTMLCanvasElement, configuration(spec, theme))
  })
}

if (figures.length > 0) {
  // Colors are baked into each chart: redraw them when the theme changes
  const draw = (theme: Theme) => drawCharts(theme).catch((error) => console.error("Chart render failed", error))
  draw(currentTheme())
  onThemeChange(draw)
}
