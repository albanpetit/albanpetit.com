import { readFileSync } from "node:fs"
import path from "node:path"
import type { Code, Html, Root } from "mdast"
import type { VFile } from "vfile"
import { visit } from "unist-util-visit"
import { parse as parseYaml } from "yaml"
import { DEFAULT_LANGUAGE, getTranslations, LANGUAGES, type Language } from "../lib/i18n"
import { publicUrl } from "./linked-files"

// Turns ```chart fences into a Chart.js chart drawn from a CSV file stored next to the post (see
// src/scripts/chart.ts), plus the data as a table: readable without JavaScript, by screen readers and in feeds.
//
//   ```chart
//   file: ./measures.csv          # required, relative to the Markdown file
//   type: line                    # line (default), bar, scatter, pie, doughnut, or table for the table alone
//   title: Temperature over a day # caption, and the chart's accessible name
//   x: time                       # label column, the first one by default
//   y: [inside, outside]          # plotted columns, every other one by default
//   xLabel: Hour                  # axis titles, optional
//   yLabel: °C
//   ```
//
// The CSV is read at build time: after editing only a CSV, restart with `npm run dev -- --force` since Astro
// caches the rendered post until its Markdown changes.

export type ChartType = "line" | "bar" | "scatter" | "pie" | "doughnut"

/** What src/scripts/chart.ts receives, as JSON inside the figure */
export type ChartSpec = {
  type: ChartType
  labels: string[]
  datasets: { label: string; data: (number | null)[] }[]
  xLabel?: string
  yLabel?: string
}

const CHART_TYPES = ["line", "bar", "scatter", "pie", "doughnut"]
const OPTIONS = ["file", "type", "title", "x", "y", "xLabel", "yLabel"]

type Options = {
  file: string
  type: ChartType | "table"
  title?: string
  x?: string
  y?: string[]
  xLabel?: string
  yLabel?: string
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** RFC 4180 CSV: quoted fields, "" escapes, CRLF. The delimiter (",", ";" or tab) is guessed from the header */
export function parseCsv(text: string): string[][] {
  const source = text.replace(/^﻿/, "")
  const header = source.split(/\r?\n/, 1)[0].replace(/"[^"]*"/g, "")
  const delimiter = [",", ";", "\t"].reduce((best, candidate) =>
    header.split(candidate).length > header.split(best).length ? candidate : best
  )

  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false
  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') quoted = false
      else field += char
    } else if (char === '"') quoted = true
    else if (char === delimiter) {
      row.push(field)
      field = ""
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i++
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else field += char
  }
  if (field !== "" || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""))
}

/** "12.5", "12,5" (French spreadsheets) or "1 234,5" → number; an empty cell is a gap in the chart */
const toNumber = (cell: string) => {
  const value = cell.trim().replace(/[\s  ]/g, "")
  if (value === "") return null
  const number = Number(/^-?\d+,\d+$/.test(value) ? value.replace(",", ".") : value)
  return Number.isFinite(number) ? number : Number.NaN
}

function readOptions(source: string, where: string): Options {
  const options = parseYaml(source) as Partial<Options> | null
  if (!options || typeof options !== "object") throw new Error(`${where}: a chart block needs at least "file:"`)
  for (const key of Object.keys(options)) {
    if (!OPTIONS.includes(key)) throw new Error(`${where}: unknown chart option "${key}" (${OPTIONS.join(", ")})`)
  }
  if (typeof options.file !== "string") throw new Error(`${where}: a chart block needs "file:", the path of its CSV`)
  const type = options.type ?? "line"
  if (type !== "table" && !CHART_TYPES.includes(type)) {
    throw new Error(`${where}: chart type "${type}" is not one of ${[...CHART_TYPES, "table"].join(", ")}`)
  }
  const y = options.y === undefined ? undefined : ([] as unknown[]).concat(options.y).map(String)
  return { ...options, file: options.file, type, y, x: options.x === undefined ? undefined : String(options.x) }
}

function toSpec(options: Options & { type: ChartType }, rows: string[][], where: string): ChartSpec {
  const [header, ...body] = rows
  const column = (name: string) => {
    const index = header.indexOf(name)
    if (index === -1) throw new Error(`${where}: no column "${name}" in ${options.file} (${header.join(", ")})`)
    return index
  }
  const xIndex = options.x === undefined ? 0 : column(options.x)
  const yIndexes = options.y ? options.y.map(column) : header.map((_, i) => i).filter((i) => i !== xIndex)

  const datasets = yIndexes.map((index) => {
    const data = body.map((cells, row) => {
      const value = toNumber(cells[index] ?? "")
      if (Number.isNaN(value)) {
        throw new Error(`${where}: "${cells[index]}" in column "${header[index]}", row ${row + 2}, is not a number`)
      }
      return value
    })
    return { label: header[index], data }
  })
  const scatter = options.type === "scatter"
  if (scatter && body.some((cells) => !Number.isFinite(toNumber(cells[xIndex] ?? "")))) {
    throw new Error(`${where}: a scatter chart needs a number in every cell of its x column "${header[xIndex]}"`)
  }

  return {
    type: options.type,
    // Scatter x values normalized ("12,5" → "12.5") so the browser can read them back as numbers
    labels: body.map((cells) => (scatter ? String(toNumber(cells[xIndex])) : (cells[xIndex] ?? ""))),
    datasets,
    xLabel: options.xLabel,
    yLabel: options.yLabel,
  }
}

function tableHtml(rows: string[][]) {
  const [header, ...body] = rows
  const cells = (row: string[], tag: "th" | "td") =>
    header.map((_, i) => `<${tag}${tag === "th" ? ' scope="col"' : ""}>${escapeHtml(row[i] ?? "")}</${tag}>`).join("")
  return (
    `<div class="chart-table" tabindex="0"><table><thead><tr>${cells(header, "th")}</tr></thead>` +
    `<tbody>${body.map((row) => `<tr>${cells(row, "td")}</tr>`).join("")}</tbody></table></div>`
  )
}

const languageOf = (file: string): Language => {
  const lang = /\.(\w+)\.md$/.exec(file)?.[1]
  return LANGUAGES.find((language) => language === lang) ?? DEFAULT_LANGUAGE
}

/** `contentDir`: CSV files must live there, the only folder the linked-files integration serves and copies */
export default function remarkChart({ contentDir }: { contentDir: string }) {
  return (tree: Root, file: VFile) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if (node.lang !== "chart" || !parent || index === undefined) return
      const where = `${file.path ?? "Markdown"}:${node.position?.start.line ?? "?"}`
      if (!file.path) throw new Error(`${where}: chart blocks need the path of their Markdown file`)

      const options = readOptions(node.value, where)
      const csvPath = path.resolve(path.dirname(file.path), options.file)
      if (!csvPath.startsWith(`${contentDir}${path.sep}`))
        throw new Error(`${where}: ${options.file} is outside content/`)
      let csv: Buffer
      try {
        csv = readFileSync(csvPath)
      } catch {
        throw new Error(`${where}: cannot read ${options.file} (${csvPath})`)
      }
      const rows = parseCsv(csv.toString("utf8"))
      if (rows.length < 2) throw new Error(`${where}: ${options.file} needs a header row and at least one data row`)

      const t = getTranslations(languageOf(file.path))
      const title = options.title ? escapeHtml(options.title) : ""
      // /static/ URL: the linked-files integration serves it in dev and copies it to the build. Encoded: the build
      // only spots unbroken URLs, so "my data.csv" must become "my%20data.csv" (it decodes them back)
      const href = encodeURI(publicUrl(csvPath, csv))
      const download = `<a class="chart-download" href="${href}" download>${escapeHtml(t("chart.download"))}</a>`
      const table = tableHtml(rows)

      let html: string
      if (options.type === "table") {
        html = `<figure class="chart chart--table">${table}${title ? `<figcaption>${title}</figcaption>` : ""}${download}</figure>`
      } else {
        const spec = toSpec(options as Options & { type: ChartType }, rows, where)
        // "<" escaped so a "</script>" in a CSV cell cannot end the script element early
        const json = JSON.stringify(spec).replace(/</g, "\\u003c")
        html =
          `<figure class="chart">` +
          `<div class="chart-canvas"><canvas role="img" aria-label="${title || escapeHtml(t("chart.chart"))}"></canvas></div>` +
          `<script type="application/json" class="chart-spec">${json}</script>` +
          (title ? `<figcaption>${title}</figcaption>` : "") +
          `<details><summary>${escapeHtml(t("chart.data"))}</summary>${table}${download}</details>` +
          `</figure>`
      }
      const replacement: Html = { type: "html", value: html }
      parent.children[index] = replacement
    })
  }
}
