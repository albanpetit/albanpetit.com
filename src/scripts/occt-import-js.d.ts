// occt-import-js ships no types: only what src/scripts/step-worker.ts uses
declare module "occt-import-js" {
  type Mesh = {
    name: string
    color?: [number, number, number]
    attributes: { position: { array: number[] }; normal?: { array: number[] } }
    index: { array: number[] }
  }

  type Occt = {
    ReadStepFile(content: Uint8Array, params: object | null): { success: boolean; meshes: Mesh[] }
  }

  export default function occtimportjs(overrides?: { locateFile?: (path: string) => string }): Promise<Occt>
}
