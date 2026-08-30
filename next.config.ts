import type { NextConfig } from "next"

/**
 * Keys from the root `.env` that must be readable in the client bundle.
 * Next inlines these at build time; `src/config/kiosk.config.ts` is the only
 * consumer. Adding a key here without adding it to `.env` and `.env.example`
 * is an incomplete change — see AGENTS.md §5.
 */
const INLINED_KEYS = [
  "KIOSK_IDLE_TIMEOUT_MS",
  "KIOSK_SUCCESS_RESET_MS",
  "KIOSK_QR_RESET_MS",
  "KIOSK_GESTURE_RECENTER_MS",
  "KIOSK_FESTIVAL_OFFER_ENABLED",
  "ENGINE_DESIGN_WIDTH",
  "ENGINE_DESIGN_HEIGHT",
  "ENGINE_MIN_ZOOM",
  "ENGINE_MAX_ZOOM",
  "FEATURE_QUIZ_ENABLED",
  "FEATURE_LEAD_FORM_ENABLED",
  "FEATURE_ADMIN_OVERLAY_ENABLED",
] as const

const inlined = Object.fromEntries(
  INLINED_KEYS.map((key) => [key, process.env[key] ?? ""]),
)

const config: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  env: {
    ...inlined,
    NEXT_PUBLIC_APP_VERSION: process.env.APP_VERSION ?? "0.0.0",
  },
}

export default config
