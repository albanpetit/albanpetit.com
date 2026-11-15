// Builds the decorative PCB drawn behind every page: traces routed at 0°/45°/90° on a grid,
// a few chip footprints with their pins, and the traces that carry an animated pulse.
// Seeded, so every build (and every page) draws the same board.

export const CIRCUIT_WIDTH = 1600
export const CIRCUIT_HEIGHT = 1000
const STEP = 20 // grid pitch, in viewBox units
const COLS = CIRCUIT_WIDTH / STEP
const ROWS = CIRCUIT_HEIGHT / STEP

/** 8 directions, 45° apart, starting East and turning clockwise */
const DIRS = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
] as const

export interface Trace {
  d: string
  /** Via at the start, unless the trace leaves a chip pin */
  start: [number, number] | null
  end: [number, number]
  /** Number of grid steps, used to pick the long traces for pulses */
  length: number
}

export interface Chip {
  x: number
  y: number
  w: number
  h: number
  pins: { x1: number; y1: number; x2: number; y2: number }[]
}

export interface Circuit {
  traces: Trace[]
  chips: Chip[]
  /** Indexes in `traces` of the traces that carry a pulse */
  pulses: number[]
}

/** Mulberry32: tiny deterministic PRNG */
function prng(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function buildCircuit(seed = 7): Circuit {
  const rand = prng(seed)
  const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1))
  const used = new Set<string>()
  const key = (c: number, r: number) => `${c},${r}`
  const free = (c: number, r: number) => c > 0 && r > 0 && c < COLS && r < ROWS && !used.has(key(c, r))
  // Keep one empty cell around everything already drawn so traces never touch
  const reserve = (c: number, r: number) => {
    for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) used.add(key(c + dc, r + dr))
  }

  const chips: Chip[] = []
  const traces: Trace[] = []

  /** Routes a trace from (c, r) heading `dir`; returns null if it runs into something too early */
  const route = (c0: number, r0: number, dir: number, minSteps: number): Trace | null => {
    let c = c0
    let r = r0
    let heading = dir
    const points: [number, number][] = [[c, r]]
    const cells: [number, number][] = []
    const segments = int(2, 5)
    for (let s = 0; s < segments; s++) {
      const diagonal = heading % 2 === 1
      const len = diagonal ? int(1, 4) : int(3, 12)
      let moved = 0
      for (let i = 0; i < len; i++) {
        const nc = c + DIRS[heading][0]
        const nr = r + DIRS[heading][1]
        if (!free(nc, nr)) break
        c = nc
        r = nr
        cells.push([c, r])
        moved++
      }
      if (moved === 0) break
      points.push([c, r])
      // Bend by 45°: orthogonal runs alternate with short diagonals, as a router would draw them
      heading = (heading + (rand() < 0.5 ? 1 : 7)) % 8
    }
    if (cells.length < minSteps) return null
    for (const [x, y] of cells) reserve(x, y)
    reserve(c0, r0)
    const d = points.map(([x, y], i) => `${i ? "L" : "M"}${x * STEP} ${y * STEP}`).join("")
    return { d, start: [c0 * STEP, r0 * STEP], end: [c * STEP, r * STEP], length: cells.length }
  }

  // Chips near the edges, so the reading column stays quiet
  const chipSpots: [number, number, number, number][] = [
    [6, 10, 6, 6],
    [68, 34, 8, 5],
    [10, 40, 5, 5],
    [72, 6, 5, 5],
  ]
  for (const [cc, cr, cw, ch] of chipSpots) {
    for (let c = cc - 1; c <= cc + cw + 1; c++) for (let r = cr - 1; r <= cr + ch + 1; r++) used.add(key(c, r))
    const chip: Chip = { x: cc * STEP, y: cr * STEP, w: cw * STEP, h: ch * STEP, pins: [] }
    // One pin per grid line on each side, each one starting an outgoing trace when there is room
    const sides: { cells: [number, number][]; dir: number }[] = [
      { cells: Array.from({ length: cw - 1 }, (_, i) => [cc + 1 + i, cr - 1]), dir: 6 },
      { cells: Array.from({ length: cw - 1 }, (_, i) => [cc + 1 + i, cr + ch + 1]), dir: 2 },
      { cells: Array.from({ length: ch - 1 }, (_, i) => [cc - 1, cr + 1 + i]), dir: 4 },
      { cells: Array.from({ length: ch - 1 }, (_, i) => [cc + cw + 1, cr + 1 + i]), dir: 0 },
    ]
    for (const { cells, dir } of sides) {
      for (const [pc, pr] of cells) {
        const [dx, dy] = DIRS[dir]
        chip.pins.push({
          x1: (pc - dx) * STEP,
          y1: (pr - dy) * STEP,
          x2: pc * STEP,
          y2: pr * STEP,
        })
        if (rand() < 0.55) {
          const t = route(pc, pr, dir, 4)
          if (t) traces.push({ ...t, start: null })
        }
      }
    }
    chips.push(chip)
  }

  // Free-standing traces between two vias
  for (let tries = 0; tries < 900 && traces.length < 70; tries++) {
    const c = int(1, COLS - 1)
    const r = int(1, ROWS - 1)
    if (!free(c, r)) continue
    const t = route(c, r, int(0, 3) * 2, 6)
    if (t) traces.push(t)
  }

  const pulses = traces
    .map((t, i) => [t.length, i])
    .sort((a, b) => b[0] - a[0])
    .slice(0, 9)
    .map(([, i]) => i)

  return { traces, chips, pulses }
}
