import occtimportjs from "occt-import-js"
import wasmUrl from "occt-import-js/dist/occt-import-js.wasm?url"

// Parses a STEP file off the main thread (several seconds for a full assembly) with OpenCascade compiled to
// WebAssembly, and sends back one triangle mesh per part, its arrays transferred rather than copied

export type StepMesh = {
  name: string
  color: [number, number, number] | null
  position: Float32Array
  normal: Float32Array | null
  index: Uint32Array
}

export type StepResult = { ok: true; meshes: StepMesh[] } | { ok: false }

// The engine starts loading with the worker, while the page is still downloading the STEP file
const engine = occtimportjs({ locateFile: () => wasmUrl })

self.onmessage = async ({ data }: MessageEvent<ArrayBuffer>) => {
  try {
    const result = (await engine).ReadStepFile(new Uint8Array(data), null)
    if (!result.success) throw new Error("STEP file not readable")
    const meshes: StepMesh[] = result.meshes.map((mesh) => ({
      name: mesh.name,
      color: mesh.color ?? null,
      position: new Float32Array(mesh.attributes.position.array),
      normal: mesh.attributes.normal ? new Float32Array(mesh.attributes.normal.array) : null,
      index: new Uint32Array(mesh.index.array),
    }))
    const transfer = meshes.flatMap(({ position, normal, index }) =>
      normal ? [position.buffer, normal.buffer, index.buffer] : [position.buffer, index.buffer]
    )
    self.postMessage({ ok: true, meshes } satisfies StepResult, { transfer })
  } catch (error) {
    console.error("STEP parsing failed", error)
    self.postMessage({ ok: false } satisfies StepResult)
  }
}
