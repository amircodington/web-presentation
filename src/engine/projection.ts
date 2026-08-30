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

/**
 * Uniform scale that fits the design space inside a physical screen without
 * distortion or cropping.
 *
 * The kiosk is authored once at a fixed design size and scaled to whatever screen
 * it lands on. That is what makes a 13" laptop and a 55" TV show *proportionally
 * identical* frames — percentage-based sizing cannot promise that, because it
 * reflows when the aspect ratio changes.
 */
export function fitScale(design: Size, screen: Size): number {
  if (design.width <= 0 || design.height <= 0) return 1
  return Math.min(screen.width / design.width, screen.height / design.height)
}

/** A rectangle in canvas space. */
export interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/**
 * The box enclosing every scene, including each scene's own extent rather than
 * just its centre point. Used to frame the overview map.
 */
export function sceneExtent(
  placements: readonly ScenePlacement[],
  design: Size,
): Bounds {
  if (placements.length === 0) {
    return { minX: 0, minY: 0, maxX: design.width, maxY: design.height }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const p of placements) {
    // A rotated rectangle's axis-aligned extent, so rotated scenes are not clipped.
    const theta = (p.rotate * Math.PI) / 180
    const cos = Math.abs(Math.cos(theta))
    const sin = Math.abs(Math.sin(theta))
    const w = (design.width * cos + design.height * sin) * p.scale
    const h = (design.width * sin + design.height * cos) * p.scale

    minX = Math.min(minX, p.x - w / 2)
    minY = Math.min(minY, p.y - h / 2)
    maxX = Math.max(maxX, p.x + w / 2)
    maxY = Math.max(maxY, p.y + h / 2)
  }

  return { minX, minY, maxX, maxY }
}

/** Viewport-pixel breathing room around a fitted region. */
export type Padding = number | { top?: number; right?: number; bottom?: number; left?: number }

function normalisePadding(padding: Padding) {
  if (typeof padding === "number") {
    return { top: padding, right: padding, bottom: padding, left: padding }
  }
  return {
    top: padding.top ?? 0,
    right: padding.right ?? 0,
    bottom: padding.bottom ?? 0,
    left: padding.left ?? 0,
  }
}

/**
 * Camera transform that frames a whole region of canvas space in the viewport.
 *
 * Padding may be asymmetric: the overview map reserves extra room at the bottom so
 * the persistent chrome bar does not sit on top of the scenes it is meant to let
 * you choose between.
 */
export function fitBounds(bounds: Bounds, viewport: Size, padding: Padding = 120): CameraTransform {
  const pad = normalisePadding(padding)
  const width = Math.max(1, bounds.maxX - bounds.minX)
  const height = Math.max(1, bounds.maxY - bounds.minY)

  const available = {
    width: Math.max(1, viewport.width - pad.left - pad.right),
    height: Math.max(1, viewport.height - pad.top - pad.bottom),
  }
  const scale = Math.min(available.width / width, available.height / height)

  const centreX = (bounds.minX + bounds.maxX) / 2
  const centreY = (bounds.minY + bounds.maxY) / 2

  // Centre within the padded box rather than the raw viewport.
  return {
    x: pad.left + available.width / 2 - centreX * scale,
    y: pad.top + available.height / 2 - centreY * scale,
    scale,
    rotate: 0,
  }
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
