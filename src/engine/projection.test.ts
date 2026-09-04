import { describe, expect, it } from "vitest"
import {
  canvasBounds,
  canvasToViewport,
  fitScale,
  project,
} from "./projection"
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

describe("fitScale", () => {
  const design: Size = { width: 1920, height: 1080 }

  it("is 1 when the screen matches the design space", () => {
    expect(fitScale(design, design)).toBe(1)
  })

  it("scales down uniformly on a smaller screen", () => {
    expect(fitScale(design, { width: 960, height: 540 })).toBeCloseTo(0.5)
  })

  it("scales up on a larger screen", () => {
    expect(fitScale(design, { width: 3840, height: 2160 })).toBeCloseTo(2)
  })

  it("reserves the inset on every edge before fitting", () => {
    // 1920 - 52 = 1868 wide, 1080 - 52 = 1028 tall. Height is the tighter axis.
    expect(fitScale(design, design, 26)).toBeCloseTo(1028 / 1080)
  })

  it("leaves at least the inset of margin on the limiting axis", () => {
    const inset = 26
    const scale = fitScale(design, design, inset)
    const margin = (design.height - design.height * scale) / 2
    expect(margin).toBeGreaterThanOrEqual(inset - 0.001)
  })

  it("is unchanged when no inset is asked for", () => {
    expect(fitScale(design, design, 0)).toBe(fitScale(design, design))
  })

  it("never inverts the frame on a screen smaller than the inset", () => {
    expect(fitScale(design, { width: 20, height: 20 }, 26)).toBeGreaterThan(0)
  })

  it("takes the limiting axis so nothing is cropped", () => {
    // A 16:10 laptop is height-limited against a 16:9 design.
    expect(fitScale(design, { width: 1440, height: 900 })).toBeCloseTo(1440 / 1920)
    // A tall screen is width-limited.
    expect(fitScale(design, { width: 1000, height: 2000 })).toBeCloseTo(1000 / 1920)
  })

  it("never distorts: one scale serves both axes", () => {
    const screen = { width: 1440, height: 900 }
    const scale = fitScale(design, screen)
    expect(design.width * scale).toBeLessThanOrEqual(screen.width + 0.001)
    expect(design.height * scale).toBeLessThanOrEqual(screen.height + 0.001)
  })
})


