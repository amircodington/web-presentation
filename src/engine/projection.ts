import type { CameraTransform, ScenePlacement, Size } from "./types"

const DEG_TO_RAD = Math.PI / 180

/**
 * Computes the canvas transform that brings a scene to the centre of the viewport
 * at its authored scale and rotation.
 *
 * The result is the inverse of the scene's own placement: to look at something,
 * you move the world the opposite way. Composition order is fixed and must not be
 * varied, because transform composition is not commutative:
 *
 *   translate(viewport centre) → rotate(-θ) → scale(1/s) → translate(-x, -y)
 *
 * Applied to a canvas with `transform-origin: 0 0`.
 */
export function project(placement: ScenePlacement, viewport: Size): CameraTransform {
  const scale = 1 / placement.scale
  // Normalised so an unrotated scene yields 0 rather than -0.
  const rotate = placement.rotate === 0 ? 0 : -placement.rotate
  const theta = rotate * DEG_TO_RAD
  const cos = Math.cos(theta)
  const sin = Math.sin(theta)

  // Rotate and scale the scene's offset, then negate it to pull the scene to the origin.
  const rotatedX = (placement.x * cos - placement.y * sin) * scale
  const rotatedY = (placement.x * sin + placement.y * cos) * scale

  return {
    x: viewport.width / 2 - rotatedX,
    y: viewport.height / 2 - rotatedY,
    scale,
    rotate,
  }
}

/**
 * Serialises a camera transform to a CSS `transform` value.
 * Order here mirrors `project` and must stay in lockstep with it.
 */
export function toCss(transform: CameraTransform): string {
  return `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${transform.rotate}deg) scale(${transform.scale})`
}

/**
 * Maps a point in canvas space to viewport space under the given camera.
 * Used by the gesture layer to keep a pinch anchored under the fingers.
 */
export function canvasToViewport(
  point: { x: number; y: number },
  camera: CameraTransform,
): { x: number; y: number } {
  const theta = camera.rotate * DEG_TO_RAD
  const cos = Math.cos(theta)
  const sin = Math.sin(theta)
  const sx = point.x * camera.scale
  const sy = point.y * camera.scale
  return {
    x: camera.x + sx * cos - sy * sin,
    y: camera.y + sx * sin + sy * cos,
  }
}

/** Clamps a free-zoom factor to the configured range around a scene's authored scale. */
export function clampZoom(scale: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, scale))
}

/** Axis-aligned bounds of every scene placement, used to clamp free panning. */
export function canvasBounds(placements: readonly ScenePlacement[]): {
  minX: number
  minY: number
  maxX: number
  maxY: number
} {
  if (placements.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of placements) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  return { minX, minY, maxX, maxY }
}
