import type { StepResult } from "@/scripts/step-worker"

// 3D models from a STEP file (<div class="step-embed" data-src="…">). Nothing is downloaded until the reader asks:
// a full assembly and the OpenCascade engine that reads it weigh several megabytes each, too much to impose on every
// visit, and the reader's browser contacts the file's host only then. The link written inside the div (to the file on
// GitHub) stays under the viewer, and is the RSS fallback. The engine weight in the labels is the occt-import-js .wasm

const LABELS = {
  en: {
    show: "Show the 3D model",
    weight: "Downloads the STEP file, plus 7.6 MB for the 3D engine",
    downloading: (size: string) => `Downloading the model… ${size}`,
    parsing: "Reading the STEP file, this takes a few seconds…",
    hint: "Drag to rotate · scroll or pinch to zoom · right-click to pan",
    error: "The 3D model could not be loaded.",
    unit: "MB",
  },
  fr: {
    show: "Afficher le modèle 3D",
    weight: "Télécharge le fichier STEP, plus 7,6 Mo pour le moteur 3D",
    downloading: (size: string) => `Téléchargement du modèle… ${size}`,
    parsing: "Lecture du fichier STEP, quelques secondes…",
    hint: "Glisser pour tourner · molette ou pincer pour zoomer · clic droit pour déplacer",
    error: "Le modèle 3D n'a pas pu être chargé.",
    unit: "Mo",
  },
}

const lang = document.documentElement.lang === "fr" ? "fr" : "en"
const t = LABELS[lang]
const megabytes = (bytes: number) =>
  `${new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(bytes / 1e6)} ${t.unit}`

const list = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

/** Downloads the file, reporting the megabytes received (raw.githubusercontent.com compresses: no total to rely on) */
async function download(url: string, onProgress: (bytes: number) => void) {
  const response = await fetch(url)
  if (!response.ok || !response.body) throw new Error(`${url}: HTTP ${response.status}`)
  const chunks: Uint8Array[] = []
  let received = 0
  const reader = response.body.getReader()
  for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
    chunks.push(chunk.value)
    received += chunk.value.length
    onProgress(received)
  }
  const buffer = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    buffer.set(chunk, offset)
    offset += chunk.length
  }
  return buffer.buffer
}

/** Hands the file to the worker and waits for its parts */
const parse = (worker: Worker, file: ArrayBuffer) =>
  new Promise<StepResult>((resolve, reject) => {
    worker.onmessage = ({ data }: MessageEvent<StepResult>) => resolve(data)
    worker.onerror = reject
    worker.postMessage(file, [file])
  })

async function load(embed: HTMLElement, stage: HTMLElement, status: HTMLElement) {
  const src = embed.dataset.src ?? ""
  // Both start now and load while the file downloads: the worker its WebAssembly engine, the viewer Three.js
  const worker = new Worker(new URL("./step-worker.ts", import.meta.url), { type: "module" })
  const viewer = import("@/scripts/step-viewer")
  try {
    const file = await download(src, (bytes) => {
      status.textContent = t.downloading(megabytes(bytes))
    })
    status.textContent = t.parsing
    const result = await parse(worker, file)
    if (!result.ok) throw new Error(`${src}: no part could be read`)
    const { showModel } = await viewer
    stage.replaceChildren()
    showModel(stage, result.meshes, { parts: list(embed.dataset.parts), transparent: list(embed.dataset.transparent) })
  } finally {
    worker.terminate()
  }
  const hint = document.createElement("p")
  hint.className = "step-embed-hint"
  hint.textContent = t.hint
  stage.append(hint)
}

for (const embed of document.querySelectorAll<HTMLElement>(".step-embed[data-src]")) {
  const stage = document.createElement("div")
  stage.className = "step-embed-stage"
  const button = document.createElement("button")
  button.type = "button"
  button.className = "step-embed-button"
  button.textContent = t.show
  const status = document.createElement("p")
  status.className = "step-embed-status"
  status.textContent = t.weight
  status.setAttribute("aria-live", "polite")
  stage.append(button, status)
  embed.prepend(stage)

  button.addEventListener("click", () => {
    button.remove()
    load(embed, stage, status).catch((error) => {
      console.error("STEP model failed", error)
      stage.replaceChildren(status)
      status.textContent = t.error
    })
  })
}
