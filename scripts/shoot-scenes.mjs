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
  gateway: [],

  "world-kids": [{ press: "کودک" }],
  "kids-needs-wants": [{ press: "کودک" }, { press: "نیاز یا خواسته" }],
  "kids-piggy-bank": [{ press: "کودک" }, { press: "قلک من" }],
  "kids-little-shop": [{ press: "کودک" }, { press: "فروشگاه کوچک" }],
  "kids-my-business": [{ press: "کودک" }, { press: "کسب‌وکار کوچولوی من" }],

  "world-teens": [{ press: "نوجوان" }],
  "game-challenge-100m": [{ press: "نوجوان" }, { press: "چالش ۱۰۰ میلیون" }],
  "game-scam-or-opportunity": [{ press: "نوجوان" }, { press: "فرصته یا کلاهبرداری" }],
  "game-price-mystery": [{ press: "نوجوان" }, { press: "راز نوسان قیمت" }],
  "teens-financial-iq": [{ press: "نوجوان" }, { press: "چالش هوش مالی" }],

  "world-adults": [{ press: "بزرگسال" }],
  "adults-purchasing-power": [{ press: "بزرگسال" }, { press: "قدرت خریدت" }],
  "adults-instalments": [{ press: "بزرگسال" }, { press: "قسط واقعاً" }],
  "adults-hot-news": [{ press: "بزرگسال" }, { press: "خبر داغ" }],
  "adults-decision-profile": [{ press: "بزرگسال" }, { press: "پروفایل تصمیم‌گیری" }],
  "game-build-a-portfolio": [{ press: "بزرگسال" }, { press: "همه پولت یک جاست" }],
  "course-masir-servat": [
    { press: "نوجوان" },
    { finishMarketGame: true },
    { press: "قدم بعدیت" },
    { press: "جزئیات" },
  ],

  "kids-course": [{ press: "کودک" }, { finishKidsGame: true }, { press: "کلاس" }],
  "course-kids-financial-literacy": [
    { press: "کودک" },
    { finishKidsGame: true },
    { press: "کلاس" },
    { press: "جزئیات" },
  ],
  "teens-path": [{ press: "نوجوان" }, { finishMarketGame: true }, { press: "قدم بعدیت" }],
  "adults-path": [{ press: "بزرگسال" }, { finishInstalmentGame: true }, { press: "قدم بعدی" }],
  connect: [{ press: "کودک" }, { finishKidsGame: true }, { press: "کلاس" }, { press: "اطلاعات کلاس" }],
  "collab-schools": [{ press: "همکاری با مدارس" }],
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
 * Every way a frame can be wrong that a screenshot alone would not tell you.
 *
 * The tray and the caption are drawn outside the scaled stage while scenes
 * reserve their clearance inside it, so the two are one stage-scale apart and a
 * mistake in `src/engine/clearance.ts` is invisible until something important is
 * underneath a button. Checked on every scene rather than trusted.
 */
async function chromeOverlaps() {
  return page.evaluate(() => {
    const scene = document.querySelector('section[data-state="active"]')
    if (!scene) return ["no active scene"]

    const hits = new Set()
    const label = (node) => {
      const text = (node.textContent || "").trim()
      if (text) return text.slice(0, 28)
      return `<${node.tagName.toLowerCase()} class="${(node.className || "").toString().slice(0, 48)}">`
    }
    const hit = (a, b) =>
      a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

    /** Text and marks, not the boxes that contain them. */
    const leaves = [...scene.querySelectorAll("*")].filter((node) => {
      if (node.children.length > 0 && node.tagName !== "svg") return false
      if (!node.textContent?.trim() && node.tagName !== "svg") return false
      const box = node.getBoundingClientRect()
      return box.width > 0 && box.height > 0
    })

    // 1. The chrome, drawn outside the stage, lying over scene content.
    const bars = [
      ["tray", document.querySelector("[data-kiosk-chrome] > div > div")],
      ["caption", document.querySelector('[role="status"]')],
    ].filter(([, node]) => node)
    for (const node of leaves) {
      for (const [name, bar] of bars) {
        if (hit(node.getBoundingClientRect(), bar.getBoundingClientRect())) {
          hits.add(`${name} covers "${label(node)}"`)
        }
      }
    }

    // 2. Content pushed out through the side of the card that holds it.
    for (const card of scene.querySelectorAll(".mat, .pill, .felt, [data-card]")) {
      const outer = card.getBoundingClientRect()
      if (outer.height < 40) continue
      for (const node of card.querySelectorAll("*")) {
        if (node.children.length > 0) continue
        if (!node.textContent?.trim()) continue
        const box = node.getBoundingClientRect()
        if (!box.height) continue
        if (box.bottom > outer.bottom + 1 || box.top < outer.top - 1) {
          hits.add(`overflows its card: "${label(node)}"`)
        }
      }
    }

    // 3. Two blocks of the same scene sitting on top of each other, which is what
    //    a grid that centres rows it cannot fit does to its neighbours.
    const blocks = [...scene.querySelectorAll("div, button, section")].filter((node) => {
      // Decorative washes are *meant* to sit behind content — a photograph held
      // back under a headline is not two blocks colliding.
      if (node.getAttribute("aria-hidden") === "true") return false
      const style = getComputedStyle(node)
      if (style.pointerEvents === "none") return false
      // A negative margin is how a design says "these are meant to overlap" — the
      // fanned coin stack, for one. Anything else colliding is an accident.
      if (parseFloat(style.marginInlineEnd) < 0 || parseFloat(style.marginInlineStart) < 0) {
        return false
      }
      const box = node.getBoundingClientRect()
      return box.height > 60 && box.width > 60
    })
    for (let i = 0; i < blocks.length; i += 1) {
      for (let j = i + 1; j < blocks.length; j += 1) {
        const a = blocks[i]
        const b = blocks[j]
        if (a.contains(b) || b.contains(a)) continue
        if (hit(a.getBoundingClientRect(), b.getBoundingClientRect())) {
          hits.add(`blocks overlap: "${label(a)}" / "${label(b)}"`)
        }
      }
    }

    // 4. Anything drawn past the edge of the stage.
    const stage = document.querySelector("[data-stage]")?.getBoundingClientRect()
    if (stage) {
      for (const node of leaves) {
        const box = node.getBoundingClientRect()
        if (box.bottom > stage.bottom + 2 || box.top < stage.top - 2) {
          hits.add(`outside the stage: "${label(node)}"`)
        }
      }
    }

    return [...hits]
  })
}

/** Plays «راز نوسان قیمت» to its result and leaves, unlocking the teens reveal. */
async function finishMarketGame() {
  await press("راز نوسان قیمت")
  for (let round = 0; round < 8; round += 1) {
    const choice = active().locator("button").filter({ hasText: "بالا می‌رود" }).first()
    if ((await choice.count()) === 0) break
    await choice.click()
    await page.waitForTimeout(500)
    await active().locator("button").filter({ hasText: /خبر بعدی|نتیجه/ }).first().click()
    await page.waitForTimeout(500)
  }
  await press("یه بازی دیگه هم بزن")
  await settle(1400)
}

/** Plays «قسط واقعاً ارزون‌تره؟» to its close, unlocking the adults reveal. */
async function finishInstalmentGame() {
  await press("قسط واقعاً")
  await active().locator("button").nth(0).click()
  await settle(2400)
  await active().locator("button").nth(0).click()
  await settle(1200)
  await press("پس چه کار کنم")
  await press("یه بازی دیگه هم بزن")
  await settle(1400)
}

await mkdir(OUT, { recursive: true })

let shot = 0
for (const [scene, steps] of Object.entries(ROUTES)) {
  await page.goto(BASE, { waitUntil: "networkidle" })
  await settle(1800)

  try {
    for (const step of steps) {
      if (step.finishKidsGame) await finishKidsGame()
      else if (step.finishMarketGame) await finishMarketGame()
      else if (step.finishInstalmentGame) await finishInstalmentGame()
      else await press(step.press)
    }
  } catch (error) {
    problems.push(`${scene}: route failed — ${String(error).split("\n")[0]}`)
    continue
  }

  await settle(900)

  for (const fault of await chromeOverlaps()) {
    problems.push(`${scene}: ${fault}`)
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
