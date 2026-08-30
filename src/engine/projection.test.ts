import { describe, expect, it } from "vitest"
import { canvasBounds, canvasToViewport, clampZoom, project } from "./projection"
import type { ScenePlacement, Size } from "./types"

const viewport: Size = { width: 1920, height: 1080 }
const centre = { x: viewport.width / 2, y: viewport.height / 2 }

function placement(over: Partial<ScenePlacement> = {}): ScenePlacement {
  return { x: 0, y: 0, scale: 1, rotate: 0, ...over }
}

describe("project", () => {
  it("centres a scene at the origin", () => {
    expect(project(placement(), viewport)).toEqual({ x: centre.x, y: centre.y, scale: 1, rotate: 0 })
  })

  it("moves the world opposite to the scene offset", () => {
    const camera = project(placement({ x: 2400, y: -800 }), viewport)
    expect(camera.x).toBeCloseTo(centre.x - 2400)
    expect(camera.y).toBeCloseTo(centre.y + 800)
  })

  it("inverts the authored scale", () => {
    expect(project(placement({ scale: 2 }), viewport).scale).toBeCloseTo(0.5)
    expect(project(placement({ scale: 0.5 }), viewport).scale).toBeCloseTo(2)
  })

  it("inverts the authored rotation", () => {
    expect(project(placement({ rotate: 6 }), viewport).rotate).toBeCloseTo(-6)
  })

  it("applies scale to the offset, not just to the scene", () => {
    const camera = project(placement({ x: 1000, scale: 2 }), viewport)
    expect(camera.x).toBeCloseTo(centre.x - 500)
  })

  it("rotates the offset before translating", () => {
    const camera = project(placement({ x: 100, y: 0, rotate: 90 }), viewport)
    // Inverse rotation of -90deg takes (100, 0) to (0, -100).
    expect(camera.x).toBeCloseTo(centre.x)
    expect(camera.y).toBeCloseTo(centre.y + 100)
  })
})

describe("project — the defining property", () => {
  const cases: ScenePlacement[] = [
    placement(),
    placement({ x: 2400, y: 1600 }),
    placement({ x: -5200, y: -900, scale: 1.4 }),
    placement({ x: 900, y: -450, rotate: -6 }),
    placement({ x: -3000, y: 2200, scale: 0.75, rotate: 12 }),
  ]

  it.each(cases)("lands the scene centre at the viewport centre: %o", (p) => {
    const camera = project(p, viewport)
    const projected = canvasToViewport({ x: p.x, y: p.y }, camera)
    expect(projected.x).toBeCloseTo(centre.x, 6)
    expect(projected.y).toBeCloseTo(centre.y, 6)
  })
})

describe("clampZoom", () => {
  it("holds values inside the range", () => {
    expect(clampZoom(1.2, 0.4, 2.5)).toBe(1.2)
  })

  it("clamps both ends", () => {
    expect(clampZoom(0.1, 0.4, 2.5)).toBe(0.4)
    expect(clampZoom(9, 0.4, 2.5)).toBe(2.5)
  })
})

describe("canvasBounds", () => {
  it("returns a zero box for an empty canvas", () => {
    expect(canvasBounds([])).toEqual({ minX: 0, minY: 0, maxX: 0, maxY: 0 })
  })

  it("spans every placement", () => {
    const bounds = canvasBounds([
      placement({ x: -100, y: 40 }),
      placement({ x: 900, y: -30 }),
      placement({ x: 300, y: 500 }),
    ])
    expect(bounds).toEqual({ minX: -100, minY: -30, maxX: 900, maxY: 500 })
  })
})
