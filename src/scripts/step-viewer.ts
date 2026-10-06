import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import type { StepMesh } from "@/scripts/step-worker"

// Draws the parts parsed by src/scripts/step-worker.ts. Rendered on demand (on a drag, a zoom or a resize), never in a
// loop: an idle viewer costs nothing. The canvas is transparent, so the theme only needs the stage's CSS background

// Parts the STEP exports without a color
const DEFAULT_COLOR = new Color(0xb0b4b8)
// See-through parts lose their own color: a tinted panel, layered several times over, would tint the whole model
const CLEAR_COLOR = new Color(0xdde3ea)
// Seen from the front, on the right, slightly above: FreeCAD models are Z-up and face -Y
const VIEW_DIRECTION = new Vector3(0.9, -1.6, 0.7).normalize()

export type ViewerOptions = {
  /** Only the parts whose name contains one of these; every part when empty */
  parts: string[]
  /** Parts drawn see-through (clear panels), matched the same way */
  transparent: string[]
}

const matches = (name: string, patterns: string[]) => patterns.some((pattern) => name.includes(pattern))

export function showModel(stage: HTMLElement, meshes: StepMesh[], { parts, transparent }: ViewerOptions) {
  const scene = new Scene()
  for (const part of meshes) {
    if (parts.length > 0 && !matches(part.name, parts)) continue
    const geometry = new BufferGeometry()
    geometry.setAttribute("position", new BufferAttribute(part.position, 3))
    geometry.setIndex(new BufferAttribute(part.index, 1))
    if (part.normal) geometry.setAttribute("normal", new BufferAttribute(part.normal, 3))
    else geometry.computeVertexNormals()
    const seeThrough = matches(part.name, transparent)
    const material = new MeshStandardMaterial({
      color: seeThrough ? CLEAR_COLOR : part.color ? new Color().setRGB(...part.color, SRGBColorSpace) : DEFAULT_COLOR,
      roughness: 0.6,
      metalness: 0.05,
      transparent: seeThrough,
      opacity: seeThrough ? 0.15 : 1,
      depthWrite: !seeThrough,
    })
    scene.add(new Mesh(geometry, material))
  }

  const box = new Box3().setFromObject(scene)
  const center = box.getCenter(new Vector3())
  const radius = box.getSize(new Vector3()).length() / 2

  const camera = new PerspectiveCamera(35, 1, radius / 100, radius * 20)
  camera.up.set(0, 0, 1)
  // Close to the distance where the bounding sphere fits the 35° field of view: a box fills less than its sphere
  camera.position.copy(center).addScaledVector(VIEW_DIRECTION, (0.9 * radius) / Math.sin((35 / 2) * (Math.PI / 180)))
  // A key light that follows the camera: whatever the angle, the side facing the reader is lit
  const key = new DirectionalLight(0xffffff, 1.6)
  key.position.set(1, 1, 2)
  camera.add(key)
  scene.add(camera, new HemisphereLight(0xffffff, 0x8a8f99, 1.4))

  const renderer = new WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  stage.append(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.copy(center)
  controls.update()

  const render = () => renderer.render(scene, camera)
  controls.addEventListener("change", render)
  new ResizeObserver(() => {
    const { clientWidth: width, clientHeight: height } = stage
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    render()
  }).observe(stage)
}
