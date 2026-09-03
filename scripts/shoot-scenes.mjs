/**
 * Screenshots every scene at the real television resolution.
 *
 * The kiosk holds its whole session in memory and has no routes, so a scene can
 * only be reached the way a visitor reaches it: by touching things. Each entry in
 * `ROUTES` is therefore the sequence of labels to press, starting from the attract
 * loop, and the script asserts it landed on the scene it aimed at — a route that
 * silently ends up somewhere else would quietly screenshot the wrong frame and the
 * diff against it would be meaningless.
 *
 * Usage:
 *   node scripts/shoot-scenes.mjs [outDir] [baseUrl]
 *
 * Default output is `.screenshots/<timestamp>`, which is git-ignored. Pass a stable
 * directory to keep a baseline, then shoot again after a change and compare.
 */

import { chromium } from "playwright"
import { mkdir } from "node:fs/promises"
import { resolve } from "node:path"

const OUT = resolve(process.argv[2] ?? `.screenshots/${Date.now()}`)
const BASE = process.argv[3] ?? "http://localhost:3000/"

/** Design size from `.env` — the frame the kiosk is authored against. */
const VIEWPORT = { width: 1920, height: 1080 }

/**
 * Presses that reach one scene from the attract loop.
 *
 * `press` matches a button by the text it contains. `fill` spends an allocation
 * game's whole pot so the result screen is reachable, and `finishKidsGame` plays
 * one kids game to completion, which is what unlocks a world's product reveal.
 */
const ROUTES = {
  attract: [],
  gateway: [{ press: "" }],

  "world-kids": [{ press: "" }, { press: "کودک" }],
  "kids-needs-wants": [{ press: "" }, { press: "کودک" }, { press: "نیاز یا خواسته" }],
  "kids-piggy-bank": [{ press: "" }, { press: "کودک" }, { press: "قلک من" }],
  "kids-little-shop": [{ press: "" }, { press: "کودک" }, { press: "فروشگاه کوچک" }],
  "kids-my-business": [{ press: "" }, { press: "کودک" }, { press: "کسب‌وکار کوچولوی من" }],

  "world-teens": [{ press: "" }, { press: "نوجوان" }],
  "game-challenge-100m": [{ press: "" }, { press: "نوجوان" }, { press: "چالش ۱۰۰ میلیون" }],
  "game-scam-or-opportunity": [{ press: "" }, { press: "نوجوان" }, { press: "فرصته یا کلاهبرداری" }],
  "game-price-mystery": [{ press: "" }, { press: "نوجوان" }, { press: "راز نوسان قیمت" }],
  "teens-financial-iq": [{ press: "" }, { press: "نوجوان" }, { press: "چالش هوش مالی" }],

  "world-adults": [{ press: "" }, { press: "بزرگسال" }],
  "adults-purchasing-power": [{ press: "" }, { press: "بزرگسال" }, { press: "قدرت خریدت" }],
  "adults-instalments": [{ press: "" }, { press: "بزرگسال" }, { press: "قسط واقعاً" }],
  "adults-hot-news": [{ press: "" }, { press: "بزرگسال" }, { press: "خبر داغ" }],
  "adults-decision-profile": [{ press: "" }, { press: "بزرگسال" }, { press: "پروفایل تصمیم‌گیری" }],

  "kids-course": [{ press: "" }, { press: "کودک" }, { finishKidsGame: true }, { press: "کلاس" }],
  connect: [{ press: "" }, { press: "کودک" }, { finishKidsGame: true }, { press: "کلاس" }, { press: "اطلاعات کلاس" }],
  "collab-schools": [{ press: "" }, { press: "همکاری با مدارس" }],
}

const b = await chromium.launch()
const page = await b.newPage({ viewport: VIEWPORT })

const problems = []
page.on("pageerror", (error) => problems.push(`pageerror: ${error}`))
page.on("console", (message) => {
  if (message.type() === "error") problems.push(`console: ${message.text()}`)
})

const active = () => page.locator('section[data-scene][data-state="active"]')
const settle = (ms = 1200) => page.waitForTimeout(ms)

async function press(label) {
  const button = label
    ? active().locator("button").filter({ hasText: label }).first()
    : active().locator("button").first()
  await button.click({ timeout: 8000 })
  await settle()
}

/** Plays «قلک من» to its result and leaves, which marks the world's path started. */
async function finishKidsGame() {
  await press("قلک من")
  const buckets = ["خرج کنم", "پس‌انداز کنم", "برای هدفم نگه دارم"]
  for (let index = 0; index < 10; index += 1) {
    await active().locator("button").filter({ hasText: buckets[index % 3] }).first().click()
    await page.waitForTimeout(80)
  }
  await press("نتیجه را ببین")
  await press("یه بازی دیگه هم بزن")
  await settle(1600)
}

/**
 * Scene content the chrome is lying on top of.
 *
 * The tray and the caption are drawn outside the scaled stage while scenes
 * reserve their clearance inside it, so the two are one stage-scale apart and a
 * mistake in `src/engine/clearance.ts` is invisible until something important is
 * underneath a button. Checked on every scene rather than trusted.
 */
async function chromeOverlaps() {
  return page.evaluate(() => {
    const bars = [
      ["tray", document.querySelector("[data-kiosk-chrome] > div > div")],
      ["caption", document.querySelector('[role="status"]')],
    ].filter(([, node]) => node)

    const scene = document.querySelector('section[data-state="active"]')
    if (!scene || bars.length === 0) return []

    const hits = new Set()
    for (const node of scene.querySelectorAll("*")) {
      // Leaves only: a container's box spans its children and would report every
      // ancestor of a single overlap.
      if (node.children.length > 0 && node.tagName !== "svg") continue
      if (!node.textContent?.trim() && node.tagName !== "svg") continue

      const box = node.getBoundingClientRect()
      if (!box.width || !box.height) continue

      for (const [name, bar] of bars) {
        const it = bar.getBoundingClientRect()
        if (box.left < it.right && box.right > it.left && box.top < it.bottom && box.bottom > it.top) {
          hits.add(`${name} → "${(node.textContent || node.tagName).trim().slice(0, 28)}"`)
        }
      }
    }
    return [...hits]
  })
}

await mkdir(OUT, { recursive: true })

let shot = 0
for (const [scene, steps] of Object.entries(ROUTES)) {
  await page.goto(BASE, { waitUntil: "networkidle" })
  await settle(1800)

  try {
    for (const step of steps) {
      if (step.finishKidsGame) await finishKidsGame()
      else await press(step.press)
    }
  } catch (error) {
    problems.push(`${scene}: route failed — ${String(error).split("\n")[0]}`)
    continue
  }

  await settle(900)

  for (const covered of await chromeOverlaps()) {
    problems.push(`${scene}: chrome covers ${covered}`)
  }

  const landed = await page.evaluate(
    () => document.querySelector('section[data-scene][data-state="active"]')?.dataset.scene,
  )
  if (landed !== scene) problems.push(`${scene}: route landed on "${landed}"`)

  await page.screenshot({ path: `${OUT}/${scene}.png` })
  shot += 1
  console.log(`${landed === scene ? "ok  " : "WRONG"} ${scene}`)
}

await b.close()

console.log(`\n${shot} screenshots in ${OUT}`)
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`)
  for (const problem of problems) console.log(`  - ${problem}`)
  process.exitCode = 1
}
