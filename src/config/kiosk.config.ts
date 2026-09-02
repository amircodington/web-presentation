/**
 * Typed, frozen view over the root `.env`. This module is the ONLY place in the
 * application permitted to read `process.env` — see AGENTS.md §5.
 *
 * Values are inlined at build time by Next's `env` config for the client bundle,
 * so every key consumed here must also be exposed in `next.config.ts` or read
 * through a `NEXT_PUBLIC_` alias.
 */

/** Thrown at startup when `.env` is missing a key or holds an unparseable value. */
class ConfigError extends Error {
  constructor(key: string, reason: string) {
    super(`Invalid configuration for ${key}: ${reason}. Check the root .env file.`)
    this.name = "ConfigError"
  }
}

function readNumber(key: string, raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === "") return fallback
  const value = Number(raw)
  if (!Number.isFinite(value)) throw new ConfigError(key, `"${raw}" is not a number`)
  return value
}

function readBoolean(key: string, raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined || raw === "") return fallback
  if (raw !== "true" && raw !== "false") throw new ConfigError(key, `"${raw}" is not true or false`)
  return raw === "true"
}

const env = process.env

export const kioskConfig = Object.freeze({
  version: env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",

  idleTimeoutMs: readNumber("KIOSK_IDLE_TIMEOUT_MS", env.KIOSK_IDLE_TIMEOUT_MS, 75_000),
  successResetMs: readNumber("KIOSK_SUCCESS_RESET_MS", env.KIOSK_SUCCESS_RESET_MS, 9_000),
  qrResetMs: readNumber("KIOSK_QR_RESET_MS", env.KIOSK_QR_RESET_MS, 25_000),
  gestureRecenterMs: readNumber("KIOSK_GESTURE_RECENTER_MS", env.KIOSK_GESTURE_RECENTER_MS, 6_000),
  /** How often the schedule countdown re-reads the clock. */
  scheduleTickMs: readNumber("KIOSK_SCHEDULE_TICK_MS", env.KIOSK_SCHEDULE_TICK_MS, 20_000),
  /**
   * One full pass of the attract loop, through all three worlds. Brief §5 puts
   * it at 15–20s: long enough for a passer-by to see the whole journey, short
   * enough that the next one does not walk up mid-sentence.
   */
  attractLoopMs: readNumber("KIOSK_ATTRACT_LOOP_MS", env.KIOSK_ATTRACT_LOOP_MS, 18_000),
  festivalOfferEnabled: readBoolean(
    "KIOSK_FESTIVAL_OFFER_ENABLED",
    env.KIOSK_FESTIVAL_OFFER_ENABLED,
    true,
  ),

  engine: Object.freeze({
    designWidth: readNumber("ENGINE_DESIGN_WIDTH", env.ENGINE_DESIGN_WIDTH, 1920),
    designHeight: readNumber("ENGINE_DESIGN_HEIGHT", env.ENGINE_DESIGN_HEIGHT, 1080),
    minZoom: readNumber("ENGINE_MIN_ZOOM", env.ENGINE_MIN_ZOOM, 0.4),
    maxZoom: readNumber("ENGINE_MAX_ZOOM", env.ENGINE_MAX_ZOOM, 2.5),
    /**
     * Screen pixels left bare around the stage, so the frame reads as a card on a
     * surround rather than as a full-bleed panel with nowhere to end. Set to 0 for
     * true edge-to-edge.
     */
    stageInsetPx: readNumber("ENGINE_STAGE_INSET_PX", env.ENGINE_STAGE_INSET_PX, 26),
  }),

  features: Object.freeze({
    quiz: readBoolean("FEATURE_QUIZ_ENABLED", env.FEATURE_QUIZ_ENABLED, true),
    leadForm: readBoolean("FEATURE_LEAD_FORM_ENABLED", env.FEATURE_LEAD_FORM_ENABLED, true),
    adminOverlay: readBoolean("FEATURE_ADMIN_OVERLAY_ENABLED", env.FEATURE_ADMIN_OVERLAY_ENABLED, true),
  }),
})

export type KioskConfig = typeof kioskConfig
