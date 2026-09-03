import { kioskConfig } from "@/config/kiosk.config"
import type { Size } from "./types"

/**
 * The band at the foot of the stage that scenes must keep clear.
 *
 * The chrome — the navigation tray and the subtitle bar above it — is drawn
 * *outside* the scaled stage, in real screen pixels, so it stays legible on any
 * display. Scene padding is authored *inside* the stage, in design pixels. The
 * two therefore do not share a unit, and reserving a fixed number of design
 * pixels only happens to work at one stage scale.
 *
 * That is how a caption ended up lying across the kids world's cards: the scenes
 * reserved 240 design pixels, the subtitle's top sat 287 screen pixels above the
 * screen's foot, and at a 0.95 stage scale the reserved band fell 33 pixels short
 * of it. AGENTS.md §8 asks for this number to be derived from the chrome's
 * measured height rather than chosen; this is that derivation.
 *
 * The band is reserved whether or not a subtitle is on screen. A clearance that
 * grew when the kiosk spoke would reflow every scene mid-sentence.
 */
export interface ChromeMetrics {
  /**
   * Screen pixels from the foot of the *stage* to the underside of the tray.
   *
   * Stage-relative, not screen-relative: both bars are positioned with
   * `calc(var(--kiosk-stage-margin) + Npx)`, so the bare margin below the stage is
   * already accounted for and must not be subtracted again.
   */
  trayOffsetPx: number
  /** The tray's own height in screen pixels, borders included. */
  trayHeightPx: number
  /** Screen pixels from the foot of the stage to the underside of the caption. */
  subtitleOffsetPx: number
  /** The caption's own height in screen pixels. */
  subtitleHeightPx: number
  /** Breathing room between the chrome and the nearest scene content. */
  gapPx: number
}

/**
 * The chrome's geometry, as the components draw it.
 *
 * Kept beside the derivation rather than in `.env`: these are not tunables an
 * operator sets per event, they are measurements of markup, and a value here that
 * disagreed with the stylesheet would be worse than no value at all. Change one
 * only together with the component it describes — and prove it with
 * `scripts/shoot-scenes.mjs`, which fails when the chrome covers scene content.
 */
export const CHROME: ChromeMetrics = {
  trayOffsetPx: 52,
  trayHeightPx: 116,
  subtitleOffsetPx: 178,
  subtitleHeightPx: 83,
  gapPx: 18,
}

/**
 * How many design pixels a scene must leave at its foot, given the stage scale.
 *
 * The chrome's offsets are already relative to the stage's foot, so the only
 * conversion needed is out of screen pixels and into the stage's own units — which
 * is exactly the step a hardcoded `pb-60` skipped.
 */
export function chromeClearancePx(scale: number, chrome: ChromeMetrics = CHROME): number {
  if (!(scale > 0)) return 0

  const tallest = Math.max(
    chrome.trayOffsetPx + chrome.trayHeightPx,
    chrome.subtitleOffsetPx + chrome.subtitleHeightPx,
  )

  return Math.max(0, Math.round((tallest + chrome.gapPx) / scale))
}

/** The stage's scale and the bare margin left below it, for one screen. */
export function stageGeometry(design: Size, screen: Size, insetPx: number) {
  const scale = Math.min(
    (screen.width - insetPx * 2) / design.width,
    (screen.height - insetPx * 2) / design.height,
  )
  return {
    scale,
    stageMarginPx: Math.max(0, (screen.height - design.height * scale) / 2),
  }
}

/** The design size the kiosk is authored against. */
export const DESIGN_SIZE: Size = {
  width: kioskConfig.engine.designWidth,
  height: kioskConfig.engine.designHeight,
}
