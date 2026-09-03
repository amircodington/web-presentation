import { describe, expect, it } from "vitest"
import { CHROME, chromeClearancePx, stageGeometry } from "./clearance"

const DESIGN = { width: 1920, height: 1080 }

describe("chromeClearancePx", () => {
  it("clears the tallest thing in the chrome, not just the tray", () => {
    // The caption sits above the tray, so the tray alone is not the constraint.
    const trayOnly = chromeClearancePx(1, { ...CHROME, subtitleOffsetPx: 0, subtitleHeightPx: 0 })
    expect(chromeClearancePx(1)).toBeGreaterThan(trayOnly)
  })

  it("grows as the stage shrinks, because the chrome does not shrink with it", () => {
    expect(chromeClearancePx(0.5)).toBeGreaterThan(chromeClearancePx(1))
  })

  it("returns nothing for a degenerate scale rather than dividing by zero", () => {
    expect(chromeClearancePx(0)).toBe(0)
    expect(Number.isFinite(chromeClearancePx(0))).toBe(true)
  })

  it("covers the real 1080p geometry the overlap was measured at", () => {
    // Measured on the kiosk: the caption's top sat 287px above the screen's foot,
    // the stage's foot sat at 26px, and scenes reserved a flat 240 design pixels —
    // which came to 254px and left the caption lying on the kids world's cards.
    const { scale, stageMarginPx } = stageGeometry(DESIGN, { width: 1920, height: 1080 }, 26)
    const reservedFromScreenFoot = chromeClearancePx(scale) * scale + stageMarginPx

    expect(reservedFromScreenFoot).toBeGreaterThan(287)
  })

  it("holds on a screen far from the design size", () => {
    for (const screen of [
      { width: 1280, height: 720 },
      { width: 2560, height: 1440 },
      { width: 3840, height: 2160 },
      { width: 1600, height: 1200 },
      { width: 1920, height: 1200 },
    ]) {
      const { scale } = stageGeometry(DESIGN, screen, 26)
      const reservedAboveStageFoot = chromeClearancePx(scale) * scale
      const chromeTop = CHROME.subtitleOffsetPx + CHROME.subtitleHeightPx

      expect(reservedAboveStageFoot, `${screen.width}×${screen.height}`).toBeGreaterThanOrEqual(
        chromeTop,
      )
    }
  })
})

describe("stageGeometry", () => {
  it("fits the design frame inside the inset screen", () => {
    const { scale } = stageGeometry(DESIGN, { width: 1920, height: 1080 }, 0)
    expect(scale).toBe(1)
  })

  it("centres the stage, so the margin is half the leftover height", () => {
    const { stageMarginPx } = stageGeometry(DESIGN, { width: 1920, height: 1280 }, 0)
    expect(stageMarginPx).toBe(100)
  })
})
