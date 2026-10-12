import { createHash } from "node:crypto"
import { fileURLToPath } from "node:url"

// Mermaid diagrams are rendered ahead of time by scripts/render-diagrams.ts into one SVG per diagram,
// named after a hash of its source: editing a ```mermaid fence changes the name, so a stale SVG can never be served
export const DIAGRAMS_DIR = fileURLToPath(new URL("../diagrams/", import.meta.url))

export const diagramId = (source: string) =>
  `mermaid-${createHash("sha256").update(source.trim()).digest("hex").slice(0, 12)}`
