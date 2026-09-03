import { readFileSync } from "node:fs"
import type { NextConfig } from "next"

/**
 * Loads the git-ignored `.env.secrets` over the committed `.env`.
 *
 * Next reads `.env` and `.env.local` on its own but knows nothing about this
 * file, and the compose files pass it through `env_file` — so without this the
 * archive token would be present in a container and absent under `npm run dev`.
 * Existing values win: a variable already exported in the shell is deliberate.
 */
function loadSecrets(): void {
  let raw: string
  try {
    raw = readFileSync(".env.secrets", "utf8")
  } catch {
    return
  }

  for (const line of raw.split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line)
    if (!match) continue
    const [, key, value] = match
    if (process.env[key!] === undefined) {
      process.env[key!] = value!.trim().replace(/^["'](.*)["']$/, "$1")
    }
  }
}

loadSecrets()

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
  "KIOSK_SCHEDULE_TICK_MS",
  "ENGINE_DESIGN_WIDTH",
  "ENGINE_DESIGN_HEIGHT",
  "ENGINE_MIN_ZOOM",
  "ENGINE_MAX_ZOOM",
  "ENGINE_STAGE_INSET_PX",
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
