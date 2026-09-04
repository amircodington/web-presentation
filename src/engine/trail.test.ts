import { describe, expect, it } from "vitest"
import { TRAIL_LIMIT, canGoBack, remember, stepBack } from "./trail"

describe("remember", () => {
  it("records the scene left behind", () => {
    expect(remember([], "world-adults")).toEqual(["world-adults"])
    expect(remember(["gateway"], "world-adults")).toEqual(["gateway", "world-adults"])
  })

  it("keeps only the most recent steps", () => {
    const long = Array.from({ length: TRAIL_LIMIT }, (_, index) => `scene-${index}`)
    const trail = remember(long, "scene-last")
    expect(trail).toHaveLength(TRAIL_LIMIT)
    expect(trail.at(-1)).toBe("scene-last")
    expect(trail.at(0)).toBe("scene-1")
  })
})

describe("stepBack", () => {
  /**
   * The bug this exists for: Business School is reached from the teens' reveal
   * and from the adults', so its authored edge — the gateway — was wrong for both.
   */
  it("returns to where the visitor came from, not to the authored edge", () => {
    const trail = remember(remember([], "world-adults"), "adults-path")
    expect(stepBack(trail, { back: "gateway" })).toEqual({
      target: "adults-path",
      trail: ["world-adults"],
    })
  })

  it("unwinds one step at a time", () => {
    let trail = remember(remember([], "world-teens"), "teens-path")
    let step = stepBack(trail, { back: "gateway" })
    expect(step.target).toBe("teens-path")
    trail = step.trail
    step = stepBack(trail, { back: "gateway" })
    expect(step.target).toBe("world-teens")
    expect(step.trail).toEqual([])
  })

  it("falls back to the authored edge for a scene reached without a trail", () => {
    expect(stepBack([], { back: "world-kids" })).toEqual({ target: "world-kids", trail: [] })
  })

  it("has nowhere to go from an untravelled scene with no edge", () => {
    expect(stepBack([], {})).toEqual({ target: undefined, trail: [] })
  })
})

describe("canGoBack", () => {
  it("is true while the visitor has a route behind them", () => {
    expect(canGoBack(1, {})).toBe(true)
  })

  it("is true for a scene that names an edge", () => {
    expect(canGoBack(0, { back: "gateway" })).toBe(true)
  })

  it("is false at the start of a visit", () => {
    expect(canGoBack(0, {})).toBe(false)
  })
})
